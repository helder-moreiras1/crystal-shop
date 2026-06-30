"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/utils/cn";

const CHAKRAS = [
  "Root",
  "Sacral",
  "Solar Plexus",
  "Heart",
  "Throat",
  "Third Eye",
  "Crown",
];

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset to page 1 on filter change
      params.set("page", "1");
      return params.toString();
    },
    [searchParams]
  );

  const navigate = (updates: Record<string, string | null>) => {
    router.push(`${pathname}?${createQueryString(updates)}`);
  };

  const selectedCategory = searchParams.get("category");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStock = searchParams.get("inStock") === "true";
  const selectedChakras = searchParams.getAll("chakras");

  const toggleChakra = (chakra: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("chakras");
    params.delete("chakras");
    if (current.includes(chakra)) {
      current.filter((c) => c !== chakra).forEach((c) => params.append("chakras", c));
    } else {
      [...current, chakra].forEach((c) => params.append("chakras", c));
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  const hasFilters =
    selectedCategory || minPrice || maxPrice || inStock || selectedChakras.length > 0;

  return (
    <aside className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Category
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate({ category: null })}
              className={cn(
                "text-sm w-full text-left py-1 hover:text-primary transition-colors",
                !selectedCategory ? "text-primary font-medium" : "text-foreground/70"
              )}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => navigate({ category: cat.id })}
                className={cn(
                  "text-sm w-full text-left py-1 hover:text-primary transition-colors",
                  selectedCategory === cat.id
                    ? "text-primary font-medium"
                    : "text-foreground/70"
                )}
              >
                {cat.name}
              </button>
              {cat.children.length > 0 && (
                <ul className="ml-3 mt-1 space-y-1">
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => navigate({ category: child.id })}
                        className={cn(
                          "text-sm w-full text-left py-1 hover:text-primary transition-colors",
                          selectedCategory === child.id
                            ? "text-primary font-medium"
                            : "text-foreground/70"
                        )}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Price (£)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => navigate({ minPrice: e.target.value || null })}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => navigate({ maxPrice: e.target.value || null })}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => navigate({ inStock: e.target.checked ? "true" : null })}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground">In stock only</span>
        </label>
      </div>

      {/* Chakras */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Chakra
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {CHAKRAS.map((chakra) => (
            <button
              key={chakra}
              onClick={() => toggleChakra(chakra)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs border transition-colors",
                selectedChakras.includes(chakra)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground/70 hover:border-primary hover:text-primary"
              )}
            >
              {chakra}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
