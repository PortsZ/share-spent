"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";

import {
  useConfirmReceiptMutation,
  useCreateLineItemMutation,
  useDeleteLineItemMutation,
  useReceiptDetailQuery,
} from "../../../../stack/client";
import { Button } from "../../../../components/ui/button";
import { Card, CardSubtitle, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { FieldError, Input, Label } from "../../../../components/ui/field";
import { EmptyState, ErrorState, SkeletonList } from "../../../../components/ui/states";
import { currencyFormatter, formatDate } from "../../../../lib/utils";

const AddLineItemForm = ({
  receiptId,
  onDone,
}: {
  receiptId: string;
  onDone: () => void;
}) => {
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const createLineItem = useCreateLineItemMutation({ onSuccess: onDone });

  const priceIsValid = /^\d+(\.\d{1,2})?$/.test(unitPrice);

  return (
    <Card className="space-y-3">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!description.trim() || !priceIsValid) {
            return;
          }
          createLineItem.mutate({
            receiptId,
            description: description.trim(),
            unitPrice,
            quantity,
          });
        }}
      >
        <div>
          <Label htmlFor="item-description">Item</Label>
          <Input
            id="item-description"
            autoFocus
            maxLength={240}
            placeholder="Oat milk"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="item-price">Unit price</Label>
            <Input
              id="item-price"
              inputMode="decimal"
              placeholder="4.99"
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
            />
          </div>
          <div className="w-24">
            <Label htmlFor="item-qty">Qty</Label>
            <Input
              id="item-qty"
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>
        <FieldError>
          {unitPrice && !priceIsValid
            ? "Enter a price like 4.99"
            : createLineItem.error instanceof Error
              ? createLineItem.error.message
              : undefined}
        </FieldError>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={createLineItem.isPending || !description.trim() || !priceIsValid}
          >
            {createLineItem.isPending ? "Adding…" : "Add item"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = use(params);
  const [adding, setAdding] = useState(false);
  const { data: receipt, isPending, error, refetch } = useReceiptDetailQuery(receiptId);
  const deleteLineItem = useDeleteLineItemMutation();
  const confirmReceipt = useConfirmReceiptMutation();

  if (isPending) {
    return <SkeletonList rows={4} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (!receipt) {
    return (
      <EmptyState
        title="Receipt not found"
        description="It may have been deleted, or you may not have access to it."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/receipts"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Receipts
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">
              {receipt.merchantName ?? "Untitled receipt"}
            </CardTitle>
            <CardSubtitle>
              {receipt.receiptDate ? formatDate(receipt.receiptDate) : "No date"}
            </CardSubtitle>
          </div>
          <p className="shrink-0 text-lg font-bold tabular-nums">
            {currencyFormatter({
              amount: Number(receipt.totalAmount),
              currency: receipt.currency,
            })}
          </p>
        </div>

        {receipt.status !== "ACTIVE" ? (
          <Button
            className="mt-3"
            size="block"
            disabled={confirmReceipt.isPending}
            onClick={() => confirmReceipt.mutate({ receiptId })}
          >
            {confirmReceipt.isPending ? "Confirming…" : "Confirm receipt"}
          </Button>
        ) : (
          <Badge tone="success" className="mt-3">
            confirmed
          </Badge>
        )}
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Line items</h2>
        {!adding ? (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add
          </Button>
        ) : null}
      </div>

      {adding ? (
        <AddLineItemForm receiptId={receiptId} onDone={() => setAdding(false)} />
      ) : null}

      {receipt.lineItems.length === 0 && !adding ? (
        <EmptyState
          title="No line items"
          description="Break the receipt into items so each one can be split."
          action={<Button onClick={() => setAdding(true)}>Add an item</Button>}
        />
      ) : null}

      <ul className="space-y-2">
        {receipt.lineItems.map((item) => (
          <li key={item.id}>
            <Card className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {String(item.quantity)} ×{" "}
                  {currencyFormatter({
                    amount: Number(item.unitPrice),
                    currency: receipt.currency,
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold tabular-nums">
                  {currencyFormatter({
                    amount: Number(item.subtotal),
                    currency: receipt.currency,
                  })}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${item.description}`}
                  className="flex size-11 items-center justify-center rounded-lg text-muted-foreground active:bg-surface-muted"
                  disabled={deleteLineItem.isPending}
                  onClick={() => deleteLineItem.mutate({ lineItemId: item.id })}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
