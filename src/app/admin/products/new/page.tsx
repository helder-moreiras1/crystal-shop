import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Novo Produto" };

export default async function AdminNewProductPage() {
  const caller = await api();
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
        <h1 className="text-2xl font-bold text-foreground mt-2">Novo Produto</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Preenche os detalhes para criar um novo produto.
        </p>
      </div>

      <ProductForm
        product={{
          id: null,
          name: "",
          description: "",
          price: 0,
          stock: 0,
          sku: null,
          categoryId: categories[0]?.id ?? "",
          isActive: true,
          imageUrl: null,
        }}
        categories={categories}
      />
    </div>
  );
}
