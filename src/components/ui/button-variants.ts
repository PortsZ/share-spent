import { cva, type VariantProps } from "class-variance-authority";

/**
 * Kept out of button.tsx (a "use client" module) so server components can call
 * it to style a Link as a button.
 */
export const buttonVariants = cva(
  // min-h-11 keeps every button at/above the 44px touch target.
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-55 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:opacity-90",
        secondary:
          "border border-border bg-surface text-foreground hover:bg-surface-muted",
        ghost: "text-muted-foreground hover:bg-surface-muted",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "rounded-lg px-3 text-xs",
        md: "",
        block: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
