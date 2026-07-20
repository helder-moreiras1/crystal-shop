import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { ProductGrid } from "@/components/product/ProductGrid";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caller = await api();
  const collection = await caller.collection.bySlug({ slug });

  if (!collection) return { title: "Collection Not Found" };

  return {
    title: `${collection.name} | Ametta Crystals`,
    description: collection.description ?? `Shop our ${collection.name} collection.`,
    openGraph: collection.imageUrl
      ? { images: [{ url: collection.imageUrl }] }
      : undefined,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const caller = await api();
  const collection = await caller.collection.bySlug({ slug });

  if (!collection) notFound();

  const products = collection.products.map((cp) => cp.product);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-10 text-center">
        {collection.imageUrl && (
          <div
            className="relative h-48 sm:h-64 rounded-xl overflow-hidden mb-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${collection.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h1 className="text-3xl sm:text-4xl font-bold">{collection.name}</h1>
              {collection.description && (
                <p className="mt-2 max-w-xl text-sm sm:text-base text-white/80">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        )}
        {!collection.imageUrl && (
          <>
            <h1 className="text-3xl font-bold text-foreground">{collection.name}</h1>
            {collection.description && (
              <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                {collection.description}
              </p>
            )}
          </>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-center text-muted-foreground py-16">
          Ainda não há produtos nesta coleção.
        </p>
      )}
    </div>
  );
}
