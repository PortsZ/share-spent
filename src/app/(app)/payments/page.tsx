"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

import {
  useConfirmPaymentMutation,
  usePaymentHistoryQuery,
  usePendingPaymentsQuery,
  useRejectPaymentMutation,
} from "../../../stack/client";
import { RequireGroup } from "../../../components/require-group";
import { Button } from "../../../components/ui/button";
import { Card, CardSubtitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { EmptyState, ErrorState, SkeletonList } from "../../../components/ui/states";
import { cn, currencyFormatter, formatDate } from "../../../lib/utils";

const STATUS_TONE = {
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
} as const;

const PendingTab = ({ groupId }: { groupId: string }) => {
  const { data, isPending, error, refetch } = usePendingPaymentsQuery({ groupId });
  const confirmPayment = useConfirmPaymentMutation();
  const rejectPayment = useRejectPaymentMutation();

  if (isPending) return <SkeletonList />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  if (!data?.length) {
    return (
      <EmptyState
        title="Nothing to settle"
        description="Payments waiting on confirmation will show up here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((payment) => (
        <li key={payment.id}>
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {payment.payer.user.displayName} → {payment.payee.user.displayName}
                </p>
                <CardSubtitle>{formatDate(payment.paymentDate)}</CardSubtitle>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">
                {currencyFormatter({
                  amount: Number(payment.amount),
                  currency: payment.currency,
                })}
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                disabled={confirmPayment.isPending}
                onClick={() => confirmPayment.mutate({ paymentId: payment.id })}
              >
                <Check className="size-4" aria-hidden />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={rejectPayment.isPending}
                onClick={() => rejectPayment.mutate({ paymentId: payment.id })}
              >
                <X className="size-4" aria-hidden />
                Reject
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};

const HistoryTab = ({ groupId }: { groupId: string }) => {
  const { data, isPending, error, refetch } = usePaymentHistoryQuery({
    groupId,
    sort: "desc",
    limit: 20,
  });

  if (isPending) return <SkeletonList />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  if (!data?.items?.length) {
    return (
      <EmptyState
        title="No payments yet"
        description="Once payments are recorded, the full history lands here."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {data.items.map((payment) => (
        <li key={payment.id}>
          <Card className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {payment.payer.user.displayName} → {payment.payee.user.displayName}
              </p>
              <CardSubtitle>{formatDate(payment.paymentDate)}</CardSubtitle>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold tabular-nums">
                {currencyFormatter({
                  amount: Number(payment.amount),
                  currency: payment.currency,
                })}
              </p>
              <Badge tone={STATUS_TONE[payment.status]} className="mt-1">
                {payment.status.toLowerCase()}
              </Badge>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};

const PaymentsView = ({ groupId }: { groupId: string }) => {
  const [tab, setTab] = useState<"pending" | "history">("pending");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Payments</h1>

      <div
        role="tablist"
        aria-label="Payment views"
        className="flex rounded-xl border border-border bg-surface-muted p-1"
      >
        {(["pending", "history"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "min-h-10 flex-1 rounded-lg text-sm font-semibold capitalize transition-colors",
              tab === value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {tab === "pending" ? (
        <PendingTab groupId={groupId} />
      ) : (
        <HistoryTab groupId={groupId} />
      )}
    </div>
  );
};

export default function PaymentsPage() {
  return <RequireGroup>{(groupId) => <PaymentsView groupId={groupId} />}</RequireGroup>;
}
