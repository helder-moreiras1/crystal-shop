import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  tree: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { parentId: null },
      include: { children: true },
    });
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findUnique({
        where: { slug: input.slug },
        include: { children: true },
      });
    }),
});
