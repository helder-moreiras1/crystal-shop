import { createTRPCRouter, adminProcedure } from "@/server/trpc";
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
