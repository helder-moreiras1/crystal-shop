import { ProductCard } from "./ProductCard";
import { cn } from "@/utils/cn";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: { toNumber: () => number } | number | string;
  compareAtPrice?: { toNumber: () => number } | number | string | null;
  images: { url: string; altText: string | null }[];
  category: { name: string; slug: string };
  stock: number;
  isFeatured: boolean;
}

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
