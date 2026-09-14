import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Gem, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncUserToPrisma } from "@/lib/auth/syncUser";
import { api } from "@/lib/trpc/server";
import { formatCurrency } from "@/utils/formatCurrency";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout | Ametta Crystals" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Checkout requires an authenticated account. Preserve a return URL so the
  // customer comes back here right after logging in.
  if (!user) redirect("/login?next=/checkout");

  // Make sure the Prisma User row exists (e.g. first checkout after an OAuth
  // login that never hit the /auth/callback sync step).
  await syncUserToPrisma(user.id, user.email, user.user_metadata);

  const caller = await api();
  const cart = await caller.cart.get({});

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Gem className="mx-auto h-16 w-16 text-muted-foreground mb-6" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-foreground mb-2">O teu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-8">
          Adiciona alguns cristais ao carrinho antes de finalizar a encomenda.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Explorar a loja
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shippingCost = 0;
  const discountAmount = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax - discountAmount;

  const outOfStockItems = cart.items.filter(
    (item) => !item.product.isActive || item.product.stock < item.quantity
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold text-foreground mb-8">Finalizar Encomenda</h1>

      {outOfStockItems.length > 0 && (
        <div className="mb-8 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Stock insuficiente para um ou mais produtos. Atualize o carrinho antes de continuar.
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Shipping form */}
        <div className="lg:col-span-2">
          <CheckoutForm
            defaultEmail={user.email ?? ""}
            defaultName={(user.user_metadata?.full_name as string) ?? ""}
            disabled={outOfStockItems.length > 0}
          />
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-semibold text-foreground">Resumo da Encomenda</h2>

            <div className="space-y-3">
              {cart.items.map((item) => {
                const image = item.product.images?.[0];
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.altText ?? item.product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/40">
                          <Gem className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      {item.product.sku && (
                        <p className="text-xs text-muted-foreground/70">SKU: {item.product.sku}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground shrink-0">
                      {formatCurrency(Number(item.product.price) * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envio</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
