import type { ReactNode } from "react";

import { Badge } from "../ui/badge";
import { Card, CardSubtitle } from "../ui/card";
import { currencyFormatter, formatDate } from "../../lib/utils";

export type PaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED";

const STATUS_TONE = {
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "danger",
} as const;

export type PaymentCardProps = {
  payerName: string;
  payeeName: string;
  amount: number | string;
  currency: string;
  paymentDate: Date | string;
  status?: PaymentStatus;
  compact?: boolean;
  actions?: ReactNode;
};

export const PaymentCard = ({
  payerName,
  payeeName,
  amount,
  currency,
  paymentDate,
  status,
  compact = false,
  actions,
}: PaymentCardProps) => (
  <Card className={compact ? "flex items-center justify-between gap-3 p-3" : undefined}>
    <div className={compact ? "min-w-0" : "flex items-start justify-between gap-3"}>
      <div className="min-w-0">
        <p className={compact ? "truncate text-sm font-medium" : "truncate font-medium"}>
          {payerName} → {payeeName}
        </p>
        <CardSubtitle>{formatDate(paymentDate)}</CardSubtitle>
      </div>
      {!compact ? (
        <p className="shrink-0 font-semibold tabular-nums">
          {currencyFormatter({ amount: Number(amount), currency })}
        </p>
      ) : null}
    </div>

    {compact ? (
      <div className="shrink-0 text-right">
        <p className="font-semibold tabular-nums">
          {currencyFormatter({ amount: Number(amount), currency })}
        </p>
        {status ? (
          <Badge tone={STATUS_TONE[status]} className="mt-1">
            {status.toLowerCase()}
          </Badge>
        ) : null}
      </div>
    ) : null}

    {actions ? <div className="mt-3 flex gap-2">{actions}</div> : null}
  </Card>
);
