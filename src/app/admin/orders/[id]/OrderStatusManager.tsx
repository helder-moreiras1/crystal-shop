"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import { cn } from "@/utils/cn";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "PROCESSING", label: "Em processo" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusManager({ orderId, currentStatus }: OrderStatusManagerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const mutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Estado atualizado com sucesso", variant: "success" });
      router.refresh();
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({ title: error.message || "Erro ao atualizar estado", variant: "error" });
      setStatus(currentStatus);
      setIsUpdating(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as typeof STATUS_OPTIONS[number]["value"];
    setStatus(newStatus);
    setIsUpdating(true);
    mutation.mutate({ id: orderId, status: newStatus });
  };

  const statusLabel = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"
        )}
      >
        {statusLabel}
      </span>
      <Select
        value={status}
        onChange={handleChange}
        disabled={isUpdating}
        className="w-40 text-xs"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
