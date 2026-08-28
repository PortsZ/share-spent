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
import { EmptyState, ErrorState, SkeletonList } from "../../../components/ui/states";
import { PaymentCard } from "../../../components/entities/payment-card";
import { cn } from "../../../lib/utils";

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
          <PaymentCard
            payerName={payment.payer.user.displayName}
            payeeName={payment.payee.user.displayName}
            amount={String(payment.amount)}
            currency={payment.currency}
            paymentDate={payment.paymentDate}
            actions={
              <>
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
              </>
            }
          />
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
          <PaymentCard
            compact
            payerName={payment.payer.user.displayName}
            payeeName={payment.payee.user.displayName}
            amount={String(payment.amount)}
            currency={payment.currency}
            paymentDate={payment.paymentDate}
            status={payment.status}
          />
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
