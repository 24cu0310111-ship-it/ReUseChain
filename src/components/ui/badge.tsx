import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
        cyan:
          "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
        emerald:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        amber:
          "border border-amber-500/30 bg-amber-500/10 text-amber-300",
        rose:
          "border border-rose-500/30 bg-rose-500/10 text-rose-300",
        purple:
          "border border-purple-500/30 bg-purple-500/10 text-purple-300",
        secondary:
          "border border-white/10 bg-white/5 text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
