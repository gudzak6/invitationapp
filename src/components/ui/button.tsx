"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink-900/20 disabled:opacity-60",
        variant === "outline"
          ? "border border-ink-900/15 bg-white text-ink-900"
          : "bg-ink-900 text-white",
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
