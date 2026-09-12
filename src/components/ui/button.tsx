import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-lg shadow-sky-900/30 hover:from-sky-500 hover:to-sky-600 hover:-translate-y-0.5",
        emerald:
          "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-emerald-600 hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-900/30 hover:from-rose-500 hover:to-rose-600",
        outline:
          "border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200",
        secondary:
          "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/5",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
