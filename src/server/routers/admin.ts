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
  imageUrl: z
    .union([z.string().url("URL de imagem inválido"), z.literal("")])
    .optional(),
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
        const { sku, imageUrl, name, ...rest } = input;

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
              imageUrl && imageUrl.length > 0
                ? { create: [{ url: imageUrl, position: 0 }] }
                : undefined,
          },
        });

        return product;
      }),

    update: adminProcedure
      .input(productInputSchema.extend({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { id, sku, imageUrl, ...rest } = input;

        const product = await ctx.db.product.update({
          where: { id },
          data: {
            ...rest,
            sku: sku && sku.length > 0 ? sku : null,
          },
        });

        // Primary image lives in ProductImage (position 0) — never on Product itself.
        if (imageUrl !== undefined && imageUrl.length > 0) {
          const primaryImage = await ctx.db.productImage.findFirst({
            where: { productId: id },
            orderBy: { position: "asc" },
          });

          if (primaryImage) {
            await ctx.db.productImage.update({
              where: { id: primaryImage.id },
              data: { url: imageUrl },
            });
          } else {
            await ctx.db.productImage.create({
              data: { productId: id, url: imageUrl, position: 0 },
            });
          }
        }

        return product;
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
