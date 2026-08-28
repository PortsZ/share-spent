"use client";

import { useState } from "react";

import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "../../../stack/client";
import { Card, CardSubtitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { EmptyState, ErrorState, SkeletonList } from "../../../components/ui/states";
import { cn, formatDate } from "../../../lib/utils";

const TITLES: Record<string, string> = {
  RECEIPT_PROCESSING_FAILED: "Receipt failed to process",
  RECEIPT_READY_FOR_REVIEW: "Receipt ready for review",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_CONFIRMED: "Payment confirmed",
  INVITATION_RECEIVED: "Invitation received",
};

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isPending, error, refetch } = useNotificationsQuery({
    unreadOnly,
    limit: 20,
  });
  const markRead = useMarkNotificationReadMutation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">Alerts</h1>
        <Button
          size="sm"
          variant={unreadOnly ? "primary" : "secondary"}
          aria-pressed={unreadOnly}
          onClick={() => setUnreadOnly((value) => !value)}
        >
          Unread only
        </Button>
      </div>

      {isPending ? <SkeletonList /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}

      {data?.items.length === 0 ? (
        <EmptyState
          title={unreadOnly ? "Nothing unread" : "No alerts yet"}
          description="Receipt updates, payment confirmations, and invitations land here."
        />
      ) : null}

      <ul className="space-y-2">
        {data?.items.map((notification) => (
          <li key={notification.id}>
            <Card
              className={cn(
                "flex items-start justify-between gap-3 p-3",
                !notification.readAt && "border-primary/40",
              )}
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {TITLES[notification.type] ?? notification.title}
                </p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <CardSubtitle className="mt-1 text-xs">
                  {formatDate(notification.createdAt)}
                </CardSubtitle>
              </div>
              {!notification.readAt ? (
                <button
                  type="button"
                  className="min-h-11 shrink-0 px-2 text-sm font-semibold text-primary"
                  disabled={markRead.isPending}
                  onClick={() =>
                    markRead.mutate({ notificationId: notification.id })
                  }
                >
                  Mark read
                </button>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
