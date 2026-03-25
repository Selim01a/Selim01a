"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_18px_45px_-20px_rgba(56,189,248,0.8)] hover:brightness-110",
        secondary:
          "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
        ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
        outline:
          "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button, buttonVariants };
