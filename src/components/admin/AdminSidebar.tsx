"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { BrandLogo } from "@/components/brand/BrandLogo";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produtos", icon: Package, exact: false },
  { href: "/admin/orders", label: "Encomendas", icon: ShoppingBag, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="text-sm font-semibold text-foreground">Painel Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Abrir menu"
          className="p-2 rounded-md text-foreground/70 hover:text-primary hover:bg-accent transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40",
          "w-60 shrink-0 flex flex-col border-r border-border bg-card",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0 pt-14 md:pt-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <BrandLogo size="sm" subtitle="Painel Admin" href={null} />
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Back to store */}
        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            ← Voltar à loja
          </Link>
        </div>
      </aside>
    </>
  );
}
