"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ImageOff, Star, Trash2, Plus } from "lucide-react";
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
  /** Ordered image URLs — index 0 is always the primary image (ProductImage.position = 0). */
  images: string[];
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
  const [images, setImages] = React.useState<string[]>(product.images);
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [brokenImages, setBrokenImages] = React.useState<Record<number, boolean>>({});
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
      images,
    };

    if (isEditing) {
      updateProduct.mutate({ id: product.id as string, ...values });
    } else {
      createProduct.mutate(values);
    }
  }

  function addImage() {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      setError("URL de imagem inválido.");
      return;
    }

    setError(null);
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setBrokenImages((prev) => {
      const { [index]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function makePrimary(index: number) {
    setImages((prev) => {
      if (index === 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  }

  const handleAddImageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImage();
    }
  };

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

      {/* Image gallery */}
      <div>
        <Label>Galeria de Imagens</Label>
        <p className="text-xs text-muted-foreground mb-3">
          A primeira imagem é a imagem principal do produto.
        </p>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 mb-4">
            {images.map((url, index) => {
              const isPrimary = index === 0;
              const isBroken = brokenImages[index];
              return (
                <div
                  key={`${url}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  {isBroken ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <ImageOff className="h-6 w-6" />
                      <span className="text-[10px]">Inválida</span>
                    </div>
                  ) : (
                    <Image
                      src={url}
                      alt={`${name || "Imagem do produto"} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [index]: true }))
                      }
                    />
                  )}

                  {isPrimary && (
                    <span className="absolute top-1 left-1 inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                      <Star className="h-3 w-3" fill="currentColor" />
                      Principal
                    </span>
                  )}

                  <div className="absolute bottom-1 right-1 flex gap-1">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => makePrimary(index)}
                        aria-label="Tornar imagem principal"
                        title="Tornar principal"
                        className="rounded-full bg-background/90 border border-border p-1 hover:bg-background transition-colors"
                      >
                        <Star className="h-3.5 w-3.5 text-foreground" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label="Remover imagem"
                      title="Remover"
                      className="rounded-full bg-background/90 border border-border p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {images.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground mb-4">
            <ImageOff className="h-4 w-4" />
            Ainda sem imagens.
          </div>
        )}

        <div className="flex gap-2">
          <Input
            id="newImageUrl"
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={handleAddImageKeyDown}
            placeholder="https://…"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
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
