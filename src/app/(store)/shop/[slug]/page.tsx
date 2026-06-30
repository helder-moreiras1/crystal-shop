import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { Star } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caller = await api();
  try {
    const product = await caller.product.bySlug({ slug });
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const caller = await api();

  let product;
  try {
    product = await caller.product.bySlug({ slug });
  } catch {
    notFound();
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  const isOnSale = product.compareAtPrice !== null && product.compareAtPrice !== undefined;
  const savingAmount =
    isOnSale && product.compareAtPrice
      ? (product.compareAtPrice as unknown as { toNumber: () => number }).toNumber() -
        (product.price as unknown as { toNumber: () => number }).toNumber()
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Início</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-primary">Loja</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.categoryId}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-5">
          <div>
            <Link href={`/shop?category=${product.categoryId}`} className="text-sm text-primary hover:underline">
              {product.category.name}
            </Link>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
          </div>

          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({product.reviews.length} {product.reviews.length !== 1 ? "avaliações" : "avaliação"})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(product.price)}</span>
            {isOnSale && product.compareAtPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</span>
                <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">
                  Poupas {formatCurrency(savingAmount)}
                </span>
              </>
            )}
          </div>

          <p className={`text-sm font-medium ${product.stock === 0 ? "text-destructive" : product.stock <= 5 ? "text-yellow-600" : "text-green-600"}`}>
            {product.stock === 0 ? "Esgotado" : product.stock <= 5 ? `Apenas ${product.stock} em stock` : "Em stock"}
          </p>

          <AddToCartButton productId={product.id} stock={product.stock} />

          <div className="border-t border-border pt-5">
            <h2 className="text-sm font-semibold text-foreground mb-2">Descrição</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {product.properties.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Propriedades</h2>
              <div className="flex flex-wrap gap-1.5">
                {product.properties.map((prop) => (
                  <span key={prop} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">{prop}</span>
                ))}
              </div>
            </div>
          )}

          {product.chakras.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Chakras</h2>
              <div className="flex flex-wrap gap-1.5">
                {product.chakras.map((chakra) => (
                  <span key={chakra} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{chakra}</span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3 text-sm">
            {product.origin && (
              <div>
                <span className="text-muted-foreground">Origem</span>
                <p className="font-medium text-foreground">{product.origin}</p>
              </div>
            )}
            {product.sku && (
              <div>
                <span className="text-muted-foreground">SKU</span>
                <p className="font-medium text-foreground">{product.sku}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Avaliações dos Clientes ({product.reviews.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.user.name ?? "Anónimo"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                    ))}
                  </div>
                </div>
                {review.title && <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>}
                {review.body && <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>}
                {review.isVerified && <p className="mt-2 text-xs text-green-600 font-medium">Compra verificada</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}