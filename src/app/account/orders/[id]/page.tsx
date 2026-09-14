import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

export const metadata: Metadata = { title: "Detalhe da Encomenda" };

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING: { label: "Pendente", classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PAID: { label: "Pago", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PROCESSING: { label: "Em processo", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  SHIPPED: { label: "Enviado", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  DELIVERED: { label: "Entregue", classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelado", classes: "bg-muted text-muted-foreground" },
  REFUNDED: { label: "Reembolsado", classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const caller = await api();

  let order;
  try {
    order = await caller.order.byId({ id });
  } catch {
    notFound();
  }

  const statusConfig = STATUS_LABELS[order.status] ?? { label: order.status, classes: "bg-muted text-muted-foreground" };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar às encomendas
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Encomenda #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium self-start",
            statusConfig.classes
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Itens</h2>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item) => {
            const imageUrl = item.product.images?.[0]?.url;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
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

      {/* Total */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
