"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ImageOff } from "lucide-react";
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
  id: string | null;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string | null;
  categoryId: string;
  isActive: boolean;
  imageUrl: string | null;
}

interface ProductFormProps {
  product: ProductFormValues;
  categories: ProductFormCategory[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = product.id !== null;

  const [name, setName] = React.useState(product.name);
  const [description, setDescription] = React.useState(product.description);
  const [price, setPrice] = React.useState(String(product.price));
  const [stock, setStock] = React.useState(String(product.stock));
  const [sku, setSku] = React.useState(product.sku ?? "");
  const [categoryId, setCategoryId] = React.useState(product.categoryId);
  const [isActive, setIsActive] = React.useState(product.isActive);
  const [imageUrl, setImageUrl] = React.useState(product.imageUrl ?? "");
  const [imageError, setImageError] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const createProduct = trpc.admin.products.create.useMutation({
    onSuccess: () => {
      toast({ title: "Produto criado com sucesso!" });
      router.push("/admin/products");
      router.refresh();
    },
    onError: (err) => {
      setError(err.message);
      toast({ title: "Falha ao criar o produto.", variant: "error" });
    },
  });

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

  const isPending = createProduct.isPending || updateProduct.isPending;

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

    const values = {
      name,
      description,
      price: parsedPrice,
      stock: parsedStock,
      sku: sku.trim().length > 0 ? sku.trim() : null,
      categoryId,
      isActive,
      imageUrl: imageUrl.trim(),
    };

    if (isEditing) {
      updateProduct.mutate({ id: product.id as string, ...values });
    } else {
      createProduct.mutate(values);
    }
  }

  const trimmedImageUrl = imageUrl.trim();
  const showPreview = trimmedImageUrl.length > 0 && !imageError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Main image */}
      <div>
        <Label>Imagem principal</Label>
        <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-border bg-muted">
          {showPreview ? (
            <Image
              src={trimmedImageUrl}
              alt={name || "Imagem do produto"}
              fill
              className="object-cover"
              sizes="160px"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" />
              <span className="text-xs">Sem imagem</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <Label htmlFor="imageUrl">URL da imagem</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageError(false);
              setImageUrl(e.target.value);
            }}
            placeholder="https://…"
          />
        </div>
      </div>

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
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A guardar…
            </>
          ) : isEditing ? (
            "Guardar alterações"
          ) : (
            "Criar Produto"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
