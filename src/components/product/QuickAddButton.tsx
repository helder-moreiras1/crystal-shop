"use client";

import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/utils/cn";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cart_session_id", id);
  }
  return id;
}

interface QuickAddButtonProps {
  productId: string;
  stock: number;
}

export function QuickAddButton({ productId, stock }: QuickAddButtonProps) {
  const [added, setAdded] = useState(false);
  const utils = trpc.useUtils();

  const addItem = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      utils.cart.get.invalidate();
    },
  });

  if (stock === 0) return null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem.mutate({ productId, quantity: 1, sessionId: getOrCreateSessionId() });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={addItem.isPending || added}
      aria-label="Adicionar ao carrinho rapidamente"
      className={cn(
        "absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5",
        "rounded-full px-4 py-2 text-xs font-semibold shadow-lg",
        "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
        "transition-all duration-300 ease-out",
        "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        added
          ? "bg-green-600 text-white"
          : "bg-background/95 text-foreground hover:bg-primary hover:text-primary-foreground"
      )}
    >
      {addItem.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : added ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <ShoppingBag className="h-3.5 w-3.5" />
      )}
      {added ? "Adicionado!" : "Adicionar"}
    </button>
  );
}
