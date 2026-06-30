"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem("cart_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("cart_session_id", sid);
  }
  return sid;
}

export function useCart() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const { data: cart, refetch } = trpc.cart.get.useQuery(
    { sessionId },
    { enabled: sessionId !== undefined }
  );

  const addItem = trpc.cart.addItem.useMutation({ onSuccess: () => refetch() });
  const updateItem = trpc.cart.updateItem.useMutation({ onSuccess: () => refetch() });
  const removeItem = trpc.cart.removeItem.useMutation({ onSuccess: () => refetch() });
  const clearCart = trpc.cart.clear.useMutation({ onSuccess: () => refetch() });

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  ) ?? 0;

  return {
    cart,
    sessionId,
    itemCount,
    subtotal,
    addItem: (productId: string, quantity: number) =>
      addItem.mutate({ productId, quantity, sessionId }),
    updateItem: (cartItemId: string, quantity: number) =>
      updateItem.mutate({ cartItemId, quantity }),
    removeItem: (cartItemId: string) => removeItem.mutate({ cartItemId }),
    clearCart: () => cart && clearCart.mutate({ cartId: cart.id }),
    isLoading: addItem.isPending || updateItem.isPending || removeItem.isPending,
  };
}
