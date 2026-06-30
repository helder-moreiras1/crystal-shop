"use client";

import Link from "next/link";
import { Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Navigation } from "./Navigation";
import { CartBadge } from "@/components/cart/CartBadge";
import { cn } from "@/utils/cn";

const mobileLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/collections", label: "Collections" },
  { href: "/blog", label: "Blog" },
  { href: "/account", label: "My Account" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🔮</span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Crystal Shop
            </span>
          </Link>

          {/* Desktop navigation */}
          <Navigation />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/shop?search=1"
              aria-label="Search"
              className="p-2 rounded-md text-foreground/70 hover:text-primary hover:bg-accent transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="p-2 rounded-md text-foreground/70 hover:text-primary hover:bg-accent transition-colors hidden sm:flex"
            >
              <User className="h-5 w-5" />
            </Link>
            <CartBadge />
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-md text-foreground/70 hover:text-primary hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-background overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-4 py-3 gap-1">
          {mobileLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
