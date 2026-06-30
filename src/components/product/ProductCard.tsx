import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/utils/cn";

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

export function ProductCard({ product, className }: ProductCardProps) {
  const image = product.images[0];
  const isOnSale =
    product.compareAtPrice !== null &&
    product.compareAtPrice !== undefined;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🔮
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Featured
            </span>
          )}
          {isOnSale && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
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
