import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { cartId, email } = paymentIntent.metadata;

        const cart = await db.cart.findUnique({
          where: { id: cartId },
          include: { items: { include: { product: true } } },
        });

        if (!cart) break;

        const subtotal = cart.items.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );

        // Create order
        await db.order.create({
          data: {
            email,
            status: "PAID",
            subtotal,
            total: subtotal,
            stripePaymentIntentId: paymentIntent.id,
            shippingName: paymentIntent.shipping?.name ?? "",
            shippingLine1: paymentIntent.shipping?.address?.line1 ?? "",
            shippingCity: paymentIntent.shipping?.address?.city ?? "",
            shippingPostalCode: paymentIntent.shipping?.address?.postal_code ?? "",
            shippingCountry: paymentIntent.shipping?.address?.country ?? "GB",
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.price,
                totalPrice: Number(item.product.price) * item.quantity,
              })),
            },
          },
        });

        // Reduce stock
        await Promise.all(
          cart.items.map((item) =>
            db.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        // Clear cart
        await db.cartItem.deleteMany({ where: { cartId: cart.id } });
        break;
      }

      case "payment_intent.payment_failed": {
        console.log("Payment failed:", event.data.object.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
