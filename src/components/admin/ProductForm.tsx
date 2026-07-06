"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface ProductFormCategory {
  id: string;
  name: string;
}

export interface ProductFormValues {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string | null;
  categoryId: string;
  isActive: boolean;
}

interface ProductFormProps {
  product: ProductFormValues;
  categories: ProductFormCategory[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = React.useState(product.name);
  const [description, setDescription] = React.useState(product.description);
  const [price, setPrice] = React.useState(String(product.price));
  const [stock, setStock] = React.useState(String(product.stock));
  const [sku, setSku] = React.useState(product.sku ?? "");
  const [categoryId, setCategoryId] = React.useState(product.categoryId);
  const [isActive, setIsActive] = React.useState(product.isActive);
  const [error, setError] = React.useState<string | null>(null);

  const updateProduct = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      toast({ title: "Produto atualizado com sucesso!" });
      router.push("/admin/products");
      router.refresh();
    },
    onError: (err) => {
      setError(err.message);
      toast({ title: "Falha ao atualizar o produto.", variant: "error" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("O preço deve ser um número positivo.");
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError("O stock deve ser um número inteiro não negativo.");
      return;
    }

    updateProduct.mutate({
      id: product.id,
      name,
      description,
      price: parsedPrice,
      stock: parsedStock,
      sku: sku.trim().length > 0 ? sku.trim() : null,
      categoryId,
      isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Preço (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            step="1"
            min="0"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select
            id="categoryId"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="isActive" className="mb-0">
          Produto ativo
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={updateProduct.isPending}>
          {updateProduct.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A guardar…
            </>
          ) : (
            "Guardar alterações"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={updateProduct.isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
