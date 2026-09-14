import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { OrderStatusManager } from "./OrderStatusManager";

export const metadata: Metadata = { title: "Detalhe da Encomenda" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const caller = await api();

  let order;
  try {
    order = await caller.admin.orders.byId({ id });
  } catch {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar às encomendas
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Encomenda #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Criada em {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusManager orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer info */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Cliente</h2>
          <dl className="space-y-2 text-sm">
            {order.user?.name && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nome</dt>
                <dd className="text-foreground font-medium">{order.user.name}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{order.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ID do utilizador</dt>
              <dd className="text-foreground font-mono text-xs">
                {order.userId ?? "Convidado"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Resumo</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground">{formatCurrency(order.subtotal)}</dd>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Desconto</dt>
                <dd className="text-foreground">-{formatCurrency(order.discountAmount)}</dd>
              </div>
            )}
            {Number(order.shippingCost) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Envio</dt>
                <dd className="text-foreground">{formatCurrency(order.shippingCost)}</dd>
              </div>
            )}
            {Number(order.tax) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">IVA</dt>
                <dd className="text-foreground">{formatCurrency(order.tax)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold text-foreground">Total</dt>
              <dd className="font-bold text-foreground">{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Itens ({order.items.length})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item) => {
            const imageUrl = item.product.images?.[0]?.url;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                {/* Product image */}
                <div className="h-14 w-14 shrink-0 rounded-lg border border-border bg-muted overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-lg">
                      📦
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>

                {/* Line total */}
                <div className="text-right shrink-0">
                  <p className="font-semibold text-foreground text-sm">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
