import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  profile: createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
      });
    }),

    update: protectedProcedure
      .input(z.object({ name: z.string().min(1).optional(), avatarUrl: z.string().url().optional() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.user.update({ where: { id: ctx.user.id }, data: input });
      }),
  }),

  addresses: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      return ctx.db.address.findMany({ where: { userId: ctx.user.id } });
    }),

    create: protectedProcedure
      .input(
        z.object({
          line1: z.string().min(1),
          line2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().optional(),
          postalCode: z.string().min(1),
          country: z.string().length(2),
          isDefault: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.address.create({ data: { ...input, userId: ctx.user.id } });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.address.delete({
          where: { id: input.id, userId: ctx.user.id },
        });
      }),
  }),

  wishlist: createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.db.wishlist.findUnique({
        where: { userId: ctx.user.id },
        include: { products: { include: { product: { include: { images: { take: 1 } } } } } },
      });
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const wishlist = await ctx.db.wishlist.upsert({
          where: { userId: ctx.user.id },
          create: { userId: ctx.user.id },
          update: {},
        });
        return ctx.db.wishlistProduct.create({
          data: { wishlistId: wishlist.id, productId: input.productId },
        });
      }),

    remove: protectedProcedure
      .input(z.object({ productId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const wishlist = await ctx.db.wishlist.findUnique({
          where: { userId: ctx.user.id },
        });
        if (!wishlist) return;
        return ctx.db.wishlistProduct.delete({
          where: { wishlistId_productId: { wishlistId: wishlist.id, productId: input.productId } },
        });
      }),
  }),
});
