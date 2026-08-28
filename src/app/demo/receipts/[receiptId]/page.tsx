import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Badge } from "../../../../components/ui/badge";
import { Card, CardSubtitle, CardTitle } from "../../../../components/ui/card";
import { demoLineItems, demoReceipts } from "../../../../lib/demo/data";
import { currencyFormatter, formatDate } from "../../../../lib/utils";

export default async function DemoReceiptDetailPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;
  const receipt = demoReceipts.find((item) => item.id === receiptId);

  if (!receipt) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/demo/receipts"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Receipts
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{receipt.merchantName}</CardTitle>
            <CardSubtitle>{formatDate(receipt.receiptDate)}</CardSubtitle>
          </div>
          <p className="shrink-0 text-lg font-bold tabular-nums">
            {currencyFormatter({
              amount: Number(receipt.totalAmount),
              currency: receipt.currency,
            })}
          </p>
        </div>
        <Badge tone={receipt.status === "ACTIVE" ? "success" : "warning"} className="mt-3">
          {receipt.status.replace("_", " ").toLowerCase()}
        </Badge>
      </Card>

      <h2 className="text-lg font-semibold">Line items</h2>

      <ul className="space-y-2">
        {demoLineItems.map((item) => (
          <li key={item.id}>
            <Card className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {item.quantity} ×{" "}
                  {currencyFormatter({
                    amount: Number(item.unitPrice),
                    currency: receipt.currency,
                  })}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">
                {currencyFormatter({
                  amount: Number(item.subtotal),
                  currency: receipt.currency,
                })}
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
