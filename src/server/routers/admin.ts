import { createTRPCRouter, adminProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1, "O nome é obrigatório"),
          description: z.string().min(1, "A descrição é obrigatória"),
          price: z.number().positive("O preço deve ser positivo"),
          stock: z.number().int().min(0, "O stock não pode ser negativo"),
          sku: z.string().min(1).optional().nullable(),
          categoryId: z.string().min(1, "A categoria é obrigatória"),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, sku, ...rest } = input;

        const product = await ctx.db.product.update({
          where: { id },
          data: {
            ...rest,
            sku: sku && sku.length > 0 ? sku : null,
          },
        });

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
