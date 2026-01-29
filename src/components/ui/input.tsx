import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-fg-default)]",
          "placeholder:text-[var(--color-fg-subtle)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-error-500 focus-visible:ring-error-500"
            : "border-[var(--color-input-border)] focus-visible:ring-primary-500",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
