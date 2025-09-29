import { Prisma } from "@prisma/client";

import { prisma } from "../db";
import {
  recordPaymentSchema,
  confirmPaymentSchema,
  rejectPaymentSchema,
  pendingPaymentsFilterSchema,
  paymentHistoryFilterSchema,
  type RecordPaymentInput,
  type ConfirmPaymentInput,
  type RejectPaymentInput,
  type PendingPaymentsFilterInput,
  type PaymentHistoryFilterInput,
} from "../schemas/payments";
import {
  requireGroupRole,
  getGroupMemberByIdOrThrow,
  getGroupMemberOrThrow,
} from "./group-membership";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { logActivity } from "./activity-log";
import { toDecimal } from "../prisma-helpers";

const FINANCE_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

const loadLineItemsForPayment = async (lineItemIds: string[], payeeId: string) => {
  const items = await prisma.lineItem.findMany({
    where: { id: { in: lineItemIds }, deletedAt: null },
    include: {
      receipt: true,
      assignments: {
        where: { memberId: payeeId },
      },
      payments: {
        include: {
          payment: true,
        },
      },
    },
  });

  if (items.length !== lineItemIds.length) {
    throw new NotFoundError("One or more line items not found");
  }

  const groupIds = new Set(items.map((item) => item.receipt.groupId));

  if (groupIds.size > 1) {
    throw new ValidationError("Line items must belong to the same group");
  }

  return items;
};

const computeOutstanding = (items: Awaited<ReturnType<typeof loadLineItemsForPayment>>, payeeId: string) => {
  return items.reduce((acc, item) => {
    const assignment = item.assignments[0];
    if (!assignment) {
      throw new ValidationError("Line item missing assignment for payee");
    }

    const share = assignment.shareAmount
      ? assignment.shareAmount
      : assignment.sharePercent
        ? item.subtotal.times(assignment.sharePercent.div(100))
        : null;

    if (!share) {
      throw new ValidationError("Line item assignment missing share amount");
    }

    const paid = item.payments.reduce((paymentSum, payment) => {
      if (payment.payment.status === "REJECTED") {
        return paymentSum;
      }

      if (payment.payment.payeeId !== payeeId) {
        return paymentSum;
      }

      return paymentSum.plus(payment.amount);
    }, new Prisma.Decimal(0));

    const remaining = share.minus(paid);

    if (remaining.lessThan(0)) {
      return acc;
    }

    return acc.plus(remaining);
  }, new Prisma.Decimal(0));
};

export const recordPayment = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: RecordPaymentInput;
}) => {
  const payload = recordPaymentSchema.parse(input);

  const groupMember = await requireGroupRole(payload.groupId, actorId, FINANCE_ROLES);

  if (payload.payerId === payload.payeeId) {
    throw new ValidationError("Payer and payee must be different");
  }

  const [payer, payee] = await Promise.all([
    getGroupMemberByIdOrThrow(payload.payerId),
    getGroupMemberByIdOrThrow(payload.payeeId),
  ]);

  if (payer.groupId !== payload.groupId || payee.groupId !== payload.groupId) {
    throw new ForbiddenError("Participants must belong to the group");
  }

  const lineItemIds = payload.lineItemIds.length > 0 ? payload.lineItemIds : [];

  if (lineItemIds.length === 0) {
    throw new ValidationError("Select at least one line item for payment");
  }

  const items = await loadLineItemsForPayment(lineItemIds, payload.payeeId);

  const itemsGroupId = items[0]?.receipt.groupId;

  if (!itemsGroupId || itemsGroupId !== payload.groupId) {
    throw new ForbiddenError("Line items must belong to the selected group");
  }

  if (payload.receiptId && items.some((item) => item.receiptId !== payload.receiptId)) {
    throw new ValidationError("Line items do not belong to the chosen receipt");
  }

  const outstanding = computeOutstanding(items, payload.payeeId);
  const amount = toDecimal(payload.amount);

  if (outstanding.lessThan(amount)) {
    throw new ValidationError("Payment amount exceeds outstanding balance");
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        groupId: payload.groupId,
        receiptId: payload.receiptId ?? null,
        payerId: payload.payerId,
        payeeId: payload.payeeId,
        amount,
        currency: payload.currency,
        paymentDate: payload.paymentDate,
        notes: payload.notes ?? null,
        status: "PENDING",
      },
    });

    await Promise.all(
      items.map((item) =>
        tx.paymentLineItem.create({
          data: {
            paymentId: payment.id,
            lineItemId: item.id,
            amount: item.assignments[0]?.shareAmount
              ? item.assignments[0].shareAmount
              : item.assignments[0]?.sharePercent
                ? item.subtotal.times(item.assignments[0].sharePercent.div(100))
                : amount.div(items.length),
          },
        }),
      ),
    );

    await logActivity({
      actorId,
      groupId: payload.groupId,
      entityId: payment.id,
      entityType: "PAYMENT",
      action: "PAYMENT_RECORDED",
      after: { amount: payment.amount.toString(), payeeId: payment.payeeId },
      client: tx,
    });

    return payment;
  });

  return result;
};

export const confirmPayment = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: ConfirmPaymentInput;
}) => {
  const payload = confirmPaymentSchema.parse(input);

  const payment = await prisma.payment.findUnique({
    where: { id: payload.paymentId },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  await requireGroupRole(payment.groupId, actorId, FINANCE_ROLES);

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "CONFIRMED" },
  });

  await logActivity({
    actorId,
    groupId: payment.groupId,
    entityId: payment.id,
    entityType: "PAYMENT",
    action: "PAYMENT_CONFIRMED",
    before: { status: payment.status },
    after: { status: updated.status },
  });

  return updated;
};

export const rejectPayment = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: RejectPaymentInput;
}) => {
  const payload = rejectPaymentSchema.parse(input);

  const payment = await prisma.payment.findUnique({
    where: { id: payload.paymentId },
  });

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  await requireGroupRole(payment.groupId, actorId, FINANCE_ROLES);

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REJECTED", notes: payload.reason ?? payment.notes },
  });

  await logActivity({
    actorId,
    groupId: payment.groupId,
    entityId: payment.id,
    entityType: "PAYMENT",
    action: "PAYMENT_REJECTED",
    before: { status: payment.status },
    after: { status: updated.status },
  });

  return updated;
};

export const listPendingPayments = async (
  filters: PendingPaymentsFilterInput & { actorId: string },
) => {
  const payload = pendingPaymentsFilterSchema.parse(filters);

  await getGroupMemberOrThrow(payload.groupId, filters.actorId);

  return prisma.payment.findMany({
    where: {
      groupId: payload.groupId,
      status: "PENDING",
      OR: payload.counterpartyId
        ? [
            { payerId: payload.counterpartyId },
            { payeeId: payload.counterpartyId },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      payer: { include: { user: true } },
      payee: { include: { user: true } },
      lineItems: {
        include: { lineItem: true },
      },
    },
  });
};

export const listPaymentHistory = async (
  filters: PaymentHistoryFilterInput & { actorId: string },
) => {
  const payload = paymentHistoryFilterSchema.parse(filters);

  await getGroupMemberOrThrow(payload.groupId, filters.actorId);

  const take = payload.limit ?? 20;

  const items = await prisma.payment.findMany({
    where: {
      groupId: payload.groupId,
      status: payload.status ?? undefined,
      paymentDate: {
        gte: payload.from ?? undefined,
        lte: payload.to ?? undefined,
      },
      OR: payload.participantId
        ? [
            { payerId: payload.participantId },
            { payeeId: payload.participantId },
          ]
        : undefined,
    },
    orderBy: { paymentDate: payload.sort },
    take: take + 1,
    cursor: payload.cursor ? { id: payload.cursor } : undefined,
    include: {
      payer: { include: { user: true } },
      payee: { include: { user: true } },
      lineItems: {
        include: { lineItem: true },
      },
    },
  });

  const hasMore = items.length > take;

  return {
    items: hasMore ? items.slice(0, take) : items,
    nextCursor: hasMore ? items[take].id : null,
  };
};
