"use client";

import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/utils/cn";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  className?: string;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cart_session_id", id);
  }
  return id;
}

export function AddToCartButton({ productId, stock, className }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const utils = trpc.useUtils();

  const addItem = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      utils.cart.get.invalidate();
    },
  });

  const isOutOfStock = stock === 0;

  const handleAdd = () => {
    addItem.mutate({
      productId,
      quantity: qty,
      sessionId: getOrCreateSessionId(),
    });
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Quantity selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Qty:</span>
          <div className="flex items-center border border-input rounded-md overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-4 py-1.5 text-sm border-x border-input min-w-[3rem] text-center">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(stock, q + 1))}
              className="px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock || addItem.isPending}
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all",
          isOutOfStock
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : added
            ? "bg-green-600 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
        )}
      >
        {addItem.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingBag className="h-4 w-4" />
        )}
        {isOutOfStock
          ? "Out of Stock"
          : added
          ? "Added to Cart ✓"
          : "Add to Cart"}
      </button>
    </div>
  );
}
