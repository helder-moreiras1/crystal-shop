import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(24),
        categoryId: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        chakras: z.array(z.string()).optional(),
        sort: z
          .enum(["price_asc", "price_desc", "newest", "popular"])
          .default("newest"),
        inStock: z.boolean().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, categoryId, minPrice, maxPrice, sort, inStock, chakras, search } = input;
      const skip = (page - 1) * limit;

      const where = {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
        ...(inStock && { stock: { gt: 0 } }),
        ...(chakras && chakras.length > 0 && { chakras: { hasSome: chakras } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const orderBy =
        sort === "price_asc"
          ? { price: "asc" as const }
          : sort === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

      const [items, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
        }),
        ctx.db.product.count({ where }),
      ]);

      return { items, total, page, totalPages: Math.ceil(total / limit) };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { slug: input.slug, isActive: true },
        include: {
          images: { orderBy: { position: "asc" } },
          category: true,
          reviews: {
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!product) throw new Error("Product not found");
      return product;
    }),

  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      take: 8,
    });
  }),
});
