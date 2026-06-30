import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { formatCurrency } from "@/utils/formatCurrency";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const caller = await api();
  const stats = await caller.admin.stats();

  const cards = [
    { icon: "📦", label: "Produtos", value: stats.totalProducts.toLocaleString("pt-PT"), color: "text-blue-600" },
    { icon: "🛒", label: "Encomendas", value: stats.totalOrders.toLocaleString("pt-PT"), color: "text-green-600" },
    { icon: "👥", label: "Utilizadores", value: stats.totalUsers.toLocaleString("pt-PT"), color: "text-purple-600" },
    { icon: "💶", label: "Receita Total", value: formatCurrency(stats.revenue), color: "text-amber-600" },
  ];

  const quickLinks = [
    { href: "/admin/products", icon: "📦", title: "Gerir Produtos", desc: `${stats.totalProducts} produtos registados` },
    { href: "/admin/orders", icon: "🛒", title: "Ver Encomendas", desc: `${stats.totalOrders} encomendas no total` },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da loja</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map(({ href, icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <span className="text-2xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
