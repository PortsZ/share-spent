import type { ReactNode } from "react";

import { Card } from "./card";

export const Spinner = ({ label = "Loading" }: { label?: string }) => (
  <div role="status" aria-label={label} className="flex justify-center py-10">
    <span className="size-6 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>
);

export const SkeletonList = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3" aria-hidden>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
    ))}
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <Card className="flex flex-col items-center gap-2 py-10 text-center">
    <p className="font-semibold">{title}</p>
    <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    {action ? <div className="mt-2">{action}</div> : null}
  </Card>
);

export const ErrorState = ({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) => (
  <Card className="space-y-3 border-danger/40">
    <p className="font-semibold text-danger">Something went wrong</p>
    <p className="text-sm text-muted-foreground">
      {error instanceof Error ? error.message : "Please try again."}
    </p>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 text-sm font-semibold text-primary"
      >
        Retry
      </button>
    ) : null}
  </Card>
);
