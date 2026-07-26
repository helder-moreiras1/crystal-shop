import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

export const metadata: Metadata = { title: "As Minhas Encomendas" };

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING: { label: "Pendente", classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PAID: { label: "Pago", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PROCESSING: { label: "Em processo", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  SHIPPED: { label: "Enviado", classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  DELIVERED: { label: "Entregue", classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED: { label: "Cancelado", classes: "bg-muted text-muted-foreground" },
  REFUNDED: { label: "Reembolsado", classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const caller = await api();
  const orders = await caller.order.myOrders();

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛍️</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sem encomendas</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Ainda não fizeste nenhuma encomenda. Explora a nossa loja e encontra os cristais perfeitos para ti.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Explorar loja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">As Minhas Encomendas</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusConfig = STATUS_LABELS[order.status] ?? { label: order.status, classes: "bg-muted text-muted-foreground" };
          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground mb-1">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} · {order._count.items} {order._count.items === 1 ? "item" : "itens"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusConfig.classes
                    )}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="font-semibold text-foreground text-sm">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
