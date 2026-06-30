import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const cartRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const where = ctx.user
        ? { userId: ctx.user.id }
        : { sessionId: input.sessionId };

      return ctx.db.cart.findFirst({
        where,
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { position: "asc" }, take: 1 } },
              },
            },
          },
        },
      });
    }),

  addItem: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1).max(99),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, quantity, sessionId } = input;

      const product = await ctx.db.product.findUnique({
        where: { id: productId, isActive: true },
      });
      if (!product) throw new Error("Product not found");
      if (product.stock < quantity) throw new Error("Insufficient stock");

      const where = ctx.user ? { userId: ctx.user.id } : { sessionId };
      const create = ctx.user
        ? { userId: ctx.user.id }
        : { sessionId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };

      const cart = await ctx.db.cart.upsert({
        where: ctx.user ? { userId: ctx.user.id } : { sessionId: sessionId! },
        create,
        update: {},
      });

      await ctx.db.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity },
        update: { quantity: { increment: quantity } },
      });

      return ctx.db.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: true } } },
      });
    }),

  updateItem: publicProcedure
    .input(
      z.object({
        cartItemId: z.string(),
        quantity: z.number().min(0).max(99),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.quantity === 0) {
        return ctx.db.cartItem.delete({ where: { id: input.cartItemId } });
      }
      return ctx.db.cartItem.update({
        where: { id: input.cartItemId },
        data: { quantity: input.quantity },
      });
    }),

  removeItem: publicProcedure
    .input(z.object({ cartItemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cartItem.delete({ where: { id: input.cartItemId } });
    }),

  clear: publicProcedure
    .input(z.object({ cartId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cartItem.deleteMany({ where: { cartId: input.cartId } });
    }),
});
