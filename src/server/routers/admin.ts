import { createTRPCRouter, adminProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { slugify } from "@/utils";

// Shared shape for admin product create/update mutations.
const productInputSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  price: z.number().positive("O preço deve ser positivo"),
  stock: z.number().int().min(0, "O stock não pode ser negativo"),
  sku: z.string().min(1).optional().nullable(),
  categoryId: z.string().min(1, "A categoria é obrigatória"),
  isActive: z.boolean(),
  // Ordered image URLs — index 0 is always the primary image (ProductImage.position = 0).
  images: z.array(z.string().url("URL de imagem inválido")).max(10, "Máximo de 10 imagens").default([]),
});

export const adminRouter = createTRPCRouter({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalProducts, totalOrders, totalUsers, revenueAgg] = await Promise.all([
      ctx.db.product.count(),
      ctx.db.order.count(),
      ctx.db.user.count(),
      ctx.db.order.aggregate({
        where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      revenue: Number(revenueAgg._sum.total ?? 0),
    };
  }),

  products: createTRPCRouter({
    list: adminProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
          ctx.db.product.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              category: true,
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          }),
          ctx.db.product.count(),
        ]);

        return { items, total, totalPages: Math.ceil(total / limit) };
      }),

    byId: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const product = await ctx.db.product.findUnique({
          where: { id: input.id },
          include: {
            category: true,
            images: { orderBy: { position: "asc" } },
          },
        });

        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        return product;
      }),

    create: adminProcedure
      .input(productInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { sku, images, name, ...rest } = input;

        const baseSlug = slugify(name);
        let slug = baseSlug;
        let suffix = 1;
        // Guarantee a unique slug even if the same product name is reused.
        while (await ctx.db.product.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${suffix++}`;
        }

        const product = await ctx.db.product.create({
          data: {
            ...rest,
            name,
            slug,
            sku: sku && sku.length > 0 ? sku : null,
            // Primary image lives in ProductImage (position 0) — never on Product itself.
            images:
              images.length > 0
                ? { create: images.map((url, position) => ({ url, position })) }
                : undefined,
          },
        });

        return product;
      }),

    update: adminProcedure
      .input(productInputSchema.extend({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { id, sku, images, ...rest } = input;

        // Sync the full gallery: replace all ProductImage rows for this product
        // with the ordered list provided (index 0 stays the primary image).
        const [product] = await ctx.db.$transaction([
          ctx.db.product.update({
            where: { id },
            data: {
              ...rest,
              sku: sku && sku.length > 0 ? sku : null,
            },
          }),
          ctx.db.productImage.deleteMany({ where: { productId: id } }),
          ...(images.length > 0
            ? [
                ctx.db.productImage.createMany({
                  data: images.map((url, position) => ({ productId: id, url, position })),
                }),
              ]
            : []),
        ]);

        return product;
      }),

    remove: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { id } = input;

        const product = await ctx.db.product.findUnique({ where: { id } });
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });

        // Order history, active carts and wishlists must never be silently broken.
        // If the product is referenced anywhere, archive it instead of deleting it.
        const [orderItemCount, cartItemCount, wishlistCount] = await Promise.all([
          ctx.db.orderItem.count({ where: { productId: id } }),
          ctx.db.cartItem.count({ where: { productId: id } }),
          ctx.db.wishlistProduct.count({ where: { productId: id } }),
        ]);

        if (orderItemCount > 0 || cartItemCount > 0 || wishlistCount > 0) {
          await ctx.db.product.update({ where: { id }, data: { isActive: false } });
          return { status: "archived" as const };
        }

        await ctx.db.$transaction([
          ctx.db.productImage.deleteMany({ where: { productId: id } }),
          ctx.db.product.delete({ where: { id } }),
        ]);

        return { status: "deleted" as const };
      }),
  }),

  orders: createTRPCRouter({
    list: adminProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
          ctx.db.order.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { items: true } } },
          }),
          ctx.db.order.count(),
        ]);

        return { items, total, totalPages: Math.ceil(total / limit) };
      }),
  }),
});
