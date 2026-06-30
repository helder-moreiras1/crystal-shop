import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { cn } from "@/utils/cn";

export const metadata: Metadata = { title: "Encomendas" };

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING:    { label: "Pendente",    classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PAID:       { label: "Pago",        classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PROCESSING: { label: "Em processo", classes: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  SHIPPED:    { label: "Enviado",     classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  DELIVERED:  { label: "Entregue",   classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CANCELLED:  { label: "Cancelado",  classes: "bg-muted text-muted-foreground" },
  REFUNDED:   { label: "Reembolsado", classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const caller = await api();
  const { items, total, totalPages } = await caller.admin.orders.list({ page, limit: 20 });

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Encomendas</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{total} encomendas no total</p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Itens</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((order) => {
                const statusConfig = STATUS_LABELS[order.status] ?? { label: order.status, classes: "bg-muted text-muted-foreground" };
                return (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground truncate max-w-[180px]">{order.shippingName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{order.email}</p>
                      </div>
                    </td>

                    {/* Items count */}
                    <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">
                      {order._count.items}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                        statusConfig.classes
                      )}>
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-3xl mb-3">🛒</p>
            <p className="text-sm">Ainda não há encomendas.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <p className="text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/orders?page=${page - 1}`}
                className="rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}`}
                className="rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
              >
                Seguinte →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
