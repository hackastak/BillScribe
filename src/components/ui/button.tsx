import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center cursor-pointer justify-center font-medium transition-colors",
          "hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800":
              variant === "primary",
            "bg-[var(--color-bg-muted)] text-[var(--color-fg-default)] hover:bg-[var(--color-bg-hover)]":
              variant === "secondary",
            "text-[var(--color-fg-default)] hover:bg-[var(--color-bg-hover)]": variant === "ghost",
            "bg-[var(--color-button-destructive-bg)] text-[var(--color-button-destructive-fg)] hover:bg-[var(--color-button-destructive-hover)] active:bg-[var(--color-button-destructive-active)] focus-visible:ring-[var(--color-button-destructive-ring)]":
              variant === "destructive",
          },
          {
            "h-8 px-3 text-sm rounded-md": size === "sm",
            "h-10 px-4 text-sm rounded-lg": size === "md",
            "h-12 px-6 text-base rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
