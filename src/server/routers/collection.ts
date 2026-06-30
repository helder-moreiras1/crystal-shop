import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { z } from "zod";

export const collectionRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.collection.findMany({
      where: { isActive: true },
      include: { products: { include: { product: { include: { images: { take: 1 } } } }, orderBy: { position: "asc" }, take: 4 } },
    });
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.collection.findUnique({
        where: { slug: input.slug, isActive: true },
        include: {
          products: {
            orderBy: { position: "asc" },
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" }, take: 1 },
                  category: true,
                },
              },
            },
          },
        },
      });
    }),
});
