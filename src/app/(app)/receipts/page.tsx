"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useCreateReceiptMutation, useReceiptsQuery } from "../../../stack/client";
import { RequireGroup } from "../../../components/require-group";
import { Button } from "../../../components/ui/button";
import { Card, CardSubtitle, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { FieldError, Input, Label, Select } from "../../../components/ui/field";
import { EmptyState, ErrorState, SkeletonList } from "../../../components/ui/states";
import { currencyFormatter, formatDate } from "../../../lib/utils";

const STATUS_TONE = {
  PROCESSING: "warning",
  PENDING_REVIEW: "warning",
  DRAFT: "neutral",
  ACTIVE: "success",
  ARCHIVED: "neutral",
} as const;

const NewReceiptForm = ({
  groupId,
  onDone,
}: {
  groupId: string;
  onDone: () => void;
}) => {
  const [merchantName, setMerchantName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const createReceipt = useCreateReceiptMutation({ onSuccess: onDone });

  const amountIsValid = /^\d+(\.\d{1,2})?$/.test(totalAmount);

  return (
    <Card className="space-y-3">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!amountIsValid) {
            return;
          }
          createReceipt.mutate({
            groupId,
            merchantName: merchantName.trim() || undefined,
            totalAmount,
            currency,
            receiptDate: new Date(),
          });
        }}
      >
        <div>
          <Label htmlFor="merchant">Merchant</Label>
          <Input
            id="merchant"
            value={merchantName}
            placeholder="Corner Grocery"
            maxLength={200}
            onChange={(event) => setMerchantName(event.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              // decimal keypad on phones; the server takes a decimal string
              inputMode="decimal"
              placeholder="42.50"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
            />
          </div>
          <div className="w-28">
            <Label htmlFor="currency">Currency</Label>
            <Select
              id="currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {["USD", "EUR", "GBP", "BRL", "CAD"].map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <FieldError>
          {totalAmount && !amountIsValid
            ? "Enter an amount like 42.50"
            : createReceipt.error instanceof Error
              ? createReceipt.error.message
              : undefined}
        </FieldError>

        <div className="flex gap-2">
          <Button type="submit" disabled={createReceipt.isPending || !amountIsValid}>
            {createReceipt.isPending ? "Saving…" : "Add receipt"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

const ReceiptList = ({ groupId }: { groupId: string }) => {
  const [adding, setAdding] = useState(false);
  const { data: receipts, isPending, error, refetch } = useReceiptsQuery({ groupId });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">Receipts</h1>
        {!adding ? (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add
          </Button>
        ) : null}
      </div>

      {adding ? (
        <NewReceiptForm groupId={groupId} onDone={() => setAdding(false)} />
      ) : null}

      {isPending ? <SkeletonList /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}

      {receipts?.length === 0 && !adding ? (
        <EmptyState
          title="No receipts yet"
          description="Add a receipt and split it line by line with the group."
          action={<Button onClick={() => setAdding(true)}>Add a receipt</Button>}
        />
      ) : null}

      <ul className="space-y-3">
        {receipts?.map((receipt) => (
          <li key={receipt.id}>
            <Link href={`/receipts/${receipt.id}`} className="block">
              <Card className="active:bg-surface-muted">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate">
                      {receipt.merchantName ?? "Untitled receipt"}
                    </CardTitle>
                    <CardSubtitle>
                      {receipt.receiptDate
                        ? formatDate(receipt.receiptDate)
                        : "No date"}
                      {receipt.payer?.user?.displayName
                        ? ` · paid by ${receipt.payer.user.displayName}`
                        : null}
                    </CardSubtitle>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums">
                      {currencyFormatter({
                        amount: Number(receipt.totalAmount),
                        currency: receipt.currency,
                      })}
                    </p>
                    <Badge tone={STATUS_TONE[receipt.status]} className="mt-1">
                      {receipt.status.replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ReceiptsPage() {
  return <RequireGroup>{(groupId) => <ReceiptList groupId={groupId} />}</RequireGroup>;
}
