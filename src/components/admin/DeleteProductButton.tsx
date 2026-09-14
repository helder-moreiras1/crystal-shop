"use client";

import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useToast } from "@/components/ui/toast";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

/**
 * Destructive admin action for a product row. Archives the product
 * (isActive = false) instead of hard-deleting it whenever it has order,
 * cart or wishlist history, so past orders never break.
 */
export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const removeProduct = trpc.admin.products.remove.useMutation({
    onSuccess: (result) => {
      if (result.status === "archived") {
        toast({ title: "Produto arquivado porque já tem histórico de encomendas." });
      } else {
        toast({ title: "Produto apagado com sucesso." });
      }
      router.refresh();
    },
    onError: (err) => {
      toast({ title: err.message || "Falha ao remover o produto.", variant: "error" });
    },
  });

  function handleClick() {
    const confirmed = window.confirm(
      `Tens a certeza que queres remover "${productName}"? Se tiver encomendas, carrinhos ou listas de desejos associadas, será arquivado em vez de apagado.`
    );
    if (!confirmed) return;
    removeProduct.mutate({ id: productId });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={removeProduct.isPending}
      aria-label={`Remover ${productName}`}
      title="Apagar"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      {removeProduct.isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      Apagar
    </button>
  );
}
