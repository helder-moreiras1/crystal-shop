import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TRPCError } from "@trpc/server";
import { api } from "@/lib/trpc/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Editar Produto" };

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params;
  const caller = await api();

  let product;
  try {
    product = await caller.admin.products.byId({ id });
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const categories = await caller.category.list();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar a Produtos
        </Link>
        <h1 className="text-2xl font-bold text-foreground mt-2">Editar Produto</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{product.name}</p>
      </div>

      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          sku: product.sku,
          categoryId: product.categoryId,
          isActive: product.isActive,
        }}
        categories={categories}
      />
    </div>
  );
}
