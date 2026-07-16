import * as React from "react";
import { cn } from "@/utils/cn";

export const Switch = React.forwardRef<
  HTMLButtonElement,
  {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id?: string;
    className?: string;
    disabled?: boolean;
  }
>(({ checked, onCheckedChange, id, className, disabled }, ref) => {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
});
Switch.displayName = "Switch";
