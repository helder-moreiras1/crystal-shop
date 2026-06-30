import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { createPaymentIntent } from "@/lib/stripe/helpers";
import { TRPCError } from "@trpc/server";

const addressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().length(2),
});

export const orderRouter = createTRPCRouter({
  createIntent: publicProcedure
    .input(
      z.object({
        cartId: z.string(),
        email: z.string().email(),
        shipping: addressSchema,
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.db.cart.findUnique({
        where: { id: input.cartId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      const paymentIntent = await createPaymentIntent({
        amount: subtotal,
        currency: "eur",
        metadata: { cartId: input.cartId, email: input.email },
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        breakdown: { subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal },
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      where: { userId: ctx.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),
});
