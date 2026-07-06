import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/utils/cn";

export const metadata: Metadata = { title: "Produtos" };

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const caller = await api();
  const { items, total, totalPages } = await caller.admin.products.list({ page, limit: 20 });

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{total} produtos registados</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Produto</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Preço</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((product) => {
                const image = product.images[0];
                return (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    {/* Product name + thumbnail */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.altText ?? product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-lg">🔮</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/shop/${product.slug}`}
                            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                            target="_blank"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.sku ?? "—"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {product.category.name}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className={cn(
                        "font-medium",
                        product.stock === 0 ? "text-destructive" : product.stock <= 5 ? "text-yellow-600" : "text-foreground"
                      )}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        product.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {product.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                     <Link
                       href={`/admin/products/${product.id}`}
                       className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                         <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                         <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                       </svg>
                       Editar
                     </Link>
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
            <p className="text-3xl mb-3">📦</p>
            <p className="text-sm">Nenhum produto encontrado.</p>
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
                href={`/admin/products?page=${page - 1}`}
                className="rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/products?page=${page + 1}`}
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
