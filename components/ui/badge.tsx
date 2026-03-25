"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/20",
        secondary:
          "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/15 text-amber-100 hover:bg-amber-500/20",
        outline: "border-white/10 text-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
