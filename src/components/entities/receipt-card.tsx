import Link from "next/link";

import { Badge } from "../ui/badge";
import { Card, CardSubtitle, CardTitle } from "../ui/card";
import { currencyFormatter, formatDate } from "../../lib/utils";

export type ReceiptStatus =
  | "PROCESSING"
  | "PENDING_REVIEW"
  | "DRAFT"
  | "ACTIVE"
  | "ARCHIVED";

const STATUS_TONE = {
  PROCESSING: "warning",
  PENDING_REVIEW: "warning",
  DRAFT: "neutral",
  ACTIVE: "success",
  ARCHIVED: "neutral",
} as const;

export type ReceiptCardProps = {
  merchantName: string | null;
  receiptDate: Date | string | null;
  payerName?: string | null;
  totalAmount: number | string;
  currency: string;
  status: ReceiptStatus;
  href?: string;
};

export const ReceiptCard = ({
  merchantName,
  receiptDate,
  payerName,
  totalAmount,
  currency,
  status,
  href,
}: ReceiptCardProps) => {
  const body = (
    <Card className={href ? "active:bg-surface-muted" : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate">
            {merchantName ?? "Untitled receipt"}
          </CardTitle>
          <CardSubtitle>
            {receiptDate ? formatDate(receiptDate) : "No date"}
            {payerName ? ` · paid by ${payerName}` : null}
          </CardSubtitle>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums">
            {currencyFormatter({ amount: Number(totalAmount), currency })}
          </p>
          <Badge tone={STATUS_TONE[status]} className="mt-1">
            {status.replace("_", " ").toLowerCase()}
          </Badge>
        </div>
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
};
