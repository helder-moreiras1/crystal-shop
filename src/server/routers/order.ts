import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
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

      // Payment integration placeholder — will be implemented with Stripe later
      return {
        clientSecret: null,
        paymentIntentId: null,
        breakdown: { subtotal, discount: 0, shipping: 0, tax: 0, total: subtotal },
      };
    }),

  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      where: { userId: ctx.user.id },
      include: { items: true, _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Keep backward compatibility
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.order.findMany({
      where: { userId: ctx.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findFirst({
        where: { id: input.id, userId: ctx.user.id },
        include: {
          items: {
            include: {
              product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
            },
          },
        },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),

  // ─── DEV-ONLY: seed a test order to validate the order workflow UI ─────
  // Never usable in production — checkout is not implemented yet, so this
  // is the only way to generate realistic Order/OrderItem rows for testing.
  devSeedOrder: protectedProcedure
    .input(
      z.object({
        itemCount: z.number().int().min(2).max(3).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (process.env.NODE_ENV === "production") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "devSeedOrder is disabled in production",
        });
      }

      const products = await ctx.db.product.findMany({
        where: { isActive: true },
        take: input.itemCount,
        orderBy: { createdAt: "asc" },
      });

      if (products.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No active products found — run `npx prisma db seed` first",
        });
      }

      const items = products.map((product) => {
        const quantity = 1;
        const unitPrice = product.price;
        const totalPrice = unitPrice.mul(quantity);
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice), 0);

      const order = await ctx.db.order.create({
        data: {
          userId: ctx.user.id,
          email: ctx.user.email ?? "dev-test@ametta.local",
          status: "PENDING",
          subtotal,
          discountAmount: 0,
          shippingCost: 0,
          tax: 0,
          total: subtotal,
          shippingName: "Cliente de Teste",
          shippingLine1: "Rua de Teste, 123",
          shippingCity: "Lisboa",
          shippingPostalCode: "1000-001",
          shippingCountry: "PT",
          notes: "Encomenda gerada via devSeedOrder (apenas para testes)",
          items: { create: items },
        },
        include: { items: true },
      });

      return order;
    }),
});
