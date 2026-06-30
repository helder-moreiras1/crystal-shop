import { Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/trpc/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Loja de Cristais",
  description: "Explora a nossa coleção completa de cristais, pedras preciosas e pedras de cura.",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

function getParamAll(params: Record<string, string | string[] | undefined>, key: string): string[] {
  const val = params[key];
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const page = parseInt(getParam(params, "page") ?? "1") || 1;
  const categoryId = getParam(params, "category");
  const minPrice = getParam(params, "minPrice") ? parseFloat(getParam(params, "minPrice")!) : undefined;
  const maxPrice = getParam(params, "maxPrice") ? parseFloat(getParam(params, "maxPrice")!) : undefined;
  const chakras = getParamAll(params, "chakras");
  const sort = (getParam(params, "sort") ?? "newest") as "newest" | "price_asc" | "price_desc" | "popular";
  const inStock = getParam(params, "inStock") === "true" ? true : undefined;
  const search = getParam(params, "search");

  const caller = await api();
  const [{ items, total, totalPages }, categories] = await Promise.all([
    caller.product.list({
      page,
      limit: 24,
      categoryId,
      minPrice,
      maxPrice,
      chakras: chakras.length > 0 ? chakras : undefined,
      sort,
      inStock,
      search,
    }),
    caller.category.tree(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Início</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">Loja</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <Suspense fallback={<div className="text-sm text-muted-foreground">A carregar filtros…</div>}>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? "Nenhum produto encontrado"
                : `A mostrar ${(page - 1) * 24 + 1}–${Math.min(page * 24, total)} de ${total} produtos`}
            </p>
            <Suspense fallback={null}>
              <ProductSort />
            </Suspense>
          </div>

          {/* Grid */}
          <ProductGrid products={items} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <PaginationLink
                  params={params}
                  page={page - 1}
                aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </PaginationLink>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
                      …
                    </span>
                  ) : (
                    <PaginationLink
                      key={p}
                      params={params}
                      page={p as number}
                      active={p === page}
                    >
                      {p}
                    </PaginationLink>
                  )
                )}

              {page < totalPages && (
                <PaginationLink
                  params={params}
                  page={page + 1}
                aria-label="Página seguinte"
                >
                  <ChevronRight className="h-4 w-4" />
                </PaginationLink>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationLink({
  params,
  page,
  active,
  children,
  "aria-label": ariaLabel,
}: {
  params: Record<string, string | string[] | undefined>;
  page: number;
  active?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (key === "page") return;
    if (Array.isArray(val)) val.forEach((v) => searchParams.append(key, v));
    else if (val) searchParams.set(key, val);
  });
  searchParams.set("page", String(page));

  return (
    <Link
      href={`/shop?${searchParams.toString()}`}
      aria-label={ariaLabel}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
