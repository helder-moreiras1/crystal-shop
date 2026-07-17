import Link from "next/link";
import Image from "next/image";
import { Gem } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/utils/cn";
import { QuickAddButton } from "./QuickAddButton";

interface ProductImage {
  url: string;
  altText: string | null;
}

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: { toNumber: () => number } | number | string;
    compareAtPrice?: { toNumber: () => number } | number | string | null;
    images: ProductImage[];
    category: { name: string; slug: string };
    stock: number;
    isFeatured: boolean;
  };
  className?: string;
}

function toNumber(val: { toNumber: () => number } | number | string): number {
  if (typeof val === "object" && "toNumber" in val) return val.toNumber();
  return Number(val);
}

export function ProductCard({ product, className }: ProductCardProps) {
  const image = product.images[0];
  const isOnSale =
    product.compareAtPrice !== null && product.compareAtPrice !== undefined;
  const isOutOfStock = product.stock === 0;

  const discountPct =
    isOnSale && product.compareAtPrice
      ? Math.round(
          (1 - toNumber(product.price) / toNumber(product.compareAtPrice)) * 100
        )
      : 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl overflow-hidden",
        "border border-border",
        "hover:border-primary/40 hover:shadow-xl hover:-translate-y-1",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {/* Image — strict 1:1 */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <Gem className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}

        {/* Dim overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
              Destaque
            </span>
          )}
          {isOnSale && discountPct > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground shadow-sm">
              -{discountPct}%
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-muted/90 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
              Esgotado
            </span>
          )}
        </div>

        {/* Quick Add overlay button */}
        <QuickAddButton productId={product.id} stock={product.stock} />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.category.name}
        </p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span
            className={cn(
              "text-base font-bold",
              isOnSale ? "text-destructive" : "text-foreground"
            )}
          >
            {formatCurrency(product.price)}
          </span>
          {isOnSale && product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
