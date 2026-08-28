import type { ReactNode } from "react";

import { Card, CardSubtitle } from "../ui/card";
import { cn, formatDate } from "../../lib/utils";

const TITLES: Record<string, string> = {
  RECEIPT_PROCESSING_FAILED: "Receipt failed to process",
  RECEIPT_READY_FOR_REVIEW: "Receipt ready for review",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_CONFIRMED: "Payment confirmed",
  INVITATION_RECEIVED: "Invitation received",
};

export type NotificationCardProps = {
  type: string;
  title: string;
  message: string;
  createdAt: Date | string;
  unread: boolean;
  action?: ReactNode;
};

export const NotificationCard = ({
  type,
  title,
  message,
  createdAt,
  unread,
  action,
}: NotificationCardProps) => (
  <Card
    className={cn(
      "flex items-start justify-between gap-3 p-3",
      unread && "border-primary/40",
    )}
  >
    <div className="min-w-0">
      <p className="font-medium">{TITLES[type] ?? title}</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <CardSubtitle className="mt-1 text-xs">{formatDate(createdAt)}</CardSubtitle>
    </div>
    {action}
  </Card>
);
