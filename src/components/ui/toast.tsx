"use client";

import * as React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface Toast {
  id: string;
  title: string;
  variant?: "success" | "error";
}

interface ToastContextValue {
  toast: (input: { title: string; variant?: "success" | "error" }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(
    ({ title, variant = "success" }: { title: string; variant?: "success" | "error" }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, title, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2",
              t.variant === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400"
            )}
          >
            {t.variant === "error" ? (
              <XCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{t.title}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Fechar"
              className="ml-2 text-current/60 hover:text-current"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
