import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-border bg-surface p-4 shadow-sm",
      className,
    )}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-base font-semibold", className)} {...props} />
);

export const CardSubtitle = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
