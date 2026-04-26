import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" && "h-11 px-5",
        size === "sm" && "h-9 px-3 text-sm",
        size === "icon" && "h-10 w-10",
        variant === "primary" && "bg-rose-400 text-white shadow-soft hover:bg-rose-500",
        variant === "secondary" && "bg-white text-cocoa shadow-sm ring-1 ring-rose-100 hover:bg-rose-50",
        variant === "ghost" && "text-cocoa hover:bg-white/70",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-600",
        className
      )}
      {...props}
    />
  );
}
