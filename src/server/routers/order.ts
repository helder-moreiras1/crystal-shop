import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { checkoutInputSchema, shippingAddressSchema as addressSchema } from "@/lib/validation/checkout";

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

  // ─── Checkout: create a real Order from the customer's current cart ────
  // Stock decision: PENDING orders do NOT reduce stock. Stock is only
  // validated (not reserved) at this stage. Actual stock reduction happens
  // once payment is confirmed (Stripe integration), to avoid holding stock
  // hostage for abandoned/never-paid orders.
  createFromCart: protectedProcedure
    .input(checkoutInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Resolve the authenticated Prisma user explicitly — Cart/Order both
      // have a FK to User, so this also guarantees the row exists before we
      // try to attach anything to it.
      const dbUser = await ctx.db.user.findUnique({ where: { id: ctx.user.id } });
      if (!dbUser) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Conta não encontrada. Por favor inicia sessão novamente.",
        });
      }

      const order = await ctx.db.$transaction(async (tx) => {
        // Prefer the cart linked to the authenticated user (guest sessionId
        // carts are out of scope for now — see docs/DATABASE_SCHEMA.md).
        const cart = await tx.cart.findUnique({
          where: { userId: dbUser.id },
          include: { items: { include: { product: true } } },
        });

        if (!cart || cart.items.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "O carrinho está vazio.",
          });
        }

        // Re-validate products and stock against current DB data — never
        // trust anything about price/stock/name coming from the client.
        const hasInvalidItem = cart.items.some(
          (item) => !item.product || !item.product.isActive || item.product.stock < item.quantity
        );
        if (hasInvalidItem) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Stock insuficiente para um ou mais produtos. Atualize o carrinho antes de continuar.",
          });
        }

        const orderItems = cart.items.map((item) => {
          const unitPrice = item.product.price;
          const totalPrice = unitPrice.mul(item.quantity);
          return {
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
          };
        });

        const subtotal = orderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        // Shipping cost and tax are placeholders until real rates/Stripe Tax
        // are implemented. Discounts require the coupon flow (not yet built).
        const shippingCost = 0;
        const discountAmount = 0;
        const tax = 0;
        const total = subtotal + shippingCost + tax - discountAmount;

        const created = await tx.order.create({
          data: {
            userId: dbUser.id,
            email: input.email,
            status: "PENDING",
            subtotal,
            discountAmount,
            shippingCost,
            tax,
            total,
            shippingName: input.shipping.name,
            shippingLine1: input.shipping.line1,
            shippingLine2: input.shipping.line2 || null,
            shippingCity: input.shipping.city,
            shippingState: input.shipping.state || null,
            shippingPostalCode: input.shipping.postalCode,
            shippingCountry: input.shipping.country,
            // The schema has no dedicated phone column; storing it in `notes`
            // is the minimal option that avoids a schema change (see
            // docs/DATABASE_SCHEMA.md for the rationale).
            notes: input.phone ? `Telefone: ${input.phone}` : null,
            items: { create: orderItems },
          },
        });

        // Clear the cart only after the order + items were created — if
        // anything above threw, the whole transaction rolls back and the
        // cart is preserved untouched.
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return created;
      });

      return order;
    }),

  // ─── DEV-ONLY: seed a test order to validate the order workflow UI ─────
  // Payments are not implemented yet (orders stop at PENDING), so this
  // remains useful to quickly generate Order/OrderItem rows without going
  // through the full cart → checkout flow.
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
