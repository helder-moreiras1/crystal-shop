import Link from "next/link";

const footerLinks = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/collections", label: "Collections" },
    { href: "/shop?sort=newest", label: "New Arrivals" },
    { href: "/shop?inStock=true", label: "In Stock" },
  ],
  Help: [
    { href: "/blog", label: "Crystal Guide" },
    { href: "/faq", label: "FAQ" },
    { href: "/shipping", label: "Shipping Info" },
    { href: "/returns", label: "Returns" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔮</span>
              <span className="text-base font-semibold text-foreground">Crystal Shop</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hand-selected crystals, gemstones and healing stones, sourced with love and intention.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{heading}</h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Crystal Shop. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with 💜 for crystal lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
