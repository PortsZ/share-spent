import { Prisma } from "@prisma/client";

import { prisma } from "../db";
import {
  createReceiptSchema,
  updateReceiptSchema,
  confirmReceiptSchema,
  deleteReceiptSchema,
  receiptFiltersSchema,
  type CreateReceiptInput,
  type UpdateReceiptInput,
  type ConfirmReceiptInput,
  type DeleteReceiptInput,
  type ReceiptFiltersInput,
} from "../schemas/receipts";
import { getGroupMemberOrThrow, requireGroupRole } from "./group-membership";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { logActivity } from "./activity-log";
import { toDecimal, sumDecimals } from "../prisma-helpers";
import { getReceiptOrThrow } from "./receipts.internal";

const EDITOR_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

const requireReceiptEditable = (status: string) => {
  if (!new Set(["PROCESSING", "PENDING_REVIEW", "DRAFT"]).has(status)) {
    throw new ForbiddenError("Receipt can no longer be edited");
  }
};

export const listReceipts = async (filters: ReceiptFiltersInput & { actorId: string }) => {
  const parsed = receiptFiltersSchema.parse(filters);

  await getGroupMemberOrThrow(parsed.groupId, filters.actorId);

  return prisma.receipt.findMany({
    where: {
      groupId: parsed.groupId,
      status: parsed.status ?? undefined,
      payerId: parsed.payerId ?? undefined,
      deletedAt: null,
      receiptDate: (() => {
        if (parsed.month) {
          const monthStart = new Date(`${parsed.month}-01T00:00:00Z`);
          const monthEnd = new Date(monthStart);
          monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
          return { gte: monthStart, lt: monthEnd };
        }

        if (parsed.range) {
          return {
            gte: parsed.range.from ?? undefined,
            lte: parsed.range.to ?? undefined,
          };
        }

        return undefined;
      })(),
    },
    orderBy: { createdAt: "desc" },
    include: {
      payer: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const createReceipt = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: CreateReceiptInput;
}) => {
  const payload = createReceiptSchema.parse(input);

  const actorMember = await getGroupMemberOrThrow(payload.groupId, actorId);

  const payerId = payload.payerId ?? actorMember.id;

  const receipt = await prisma.receipt.create({
    data: {
      groupId: payload.groupId,
      status: "DRAFT",
      merchantName: payload.merchantName ?? null,
      receiptDate: payload.receiptDate ?? null,
      totalAmount: toDecimal(payload.totalAmount),
      currency: payload.currency,
      taxAmount: payload.taxAmount ? toDecimal(payload.taxAmount) : null,
      tipAmount: payload.tipAmount ? toDecimal(payload.tipAmount) : null,
      notes: payload.notes ?? null,
      imageUrl: payload.imageUrl ?? null,
      uploadedById: actorMember.id,
      payerId,
    },
  });

  await logActivity({
    actorId,
    groupId: payload.groupId,
    entityId: receipt.id,
    entityType: "RECEIPT",
    action: "RECEIPT_CREATED",
    after: receipt,
  });

  return receipt;
};

export const updateReceipt = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: UpdateReceiptInput;
}) => {
  const payload = updateReceiptSchema.parse(input);

  const receipt = await getReceiptOrThrow(payload.receiptId);

  await requireGroupRole(receipt.groupId, actorId, EDITOR_ROLES);
  requireReceiptEditable(receipt.status);

  const nextPayerId = payload.payerId ?? receipt.payerId ?? undefined;

  if (nextPayerId) {
    await prisma.groupMember.findFirstOrThrow({
      where: { id: nextPayerId, groupId: receipt.groupId },
    });
  }

  const updated = await prisma.receipt.update({
    where: { id: receipt.id },
    data: {
      merchantName: payload.merchantName ?? undefined,
      receiptDate: payload.receiptDate ?? undefined,
      totalAmount: payload.totalAmount ? toDecimal(payload.totalAmount) : undefined,
      currency: payload.currency ?? undefined,
      taxAmount: payload.taxAmount ? toDecimal(payload.taxAmount) : undefined,
      tipAmount: payload.tipAmount ? toDecimal(payload.tipAmount) : undefined,
      notes: payload.notes ?? undefined,
      imageUrl: payload.imageUrl ?? undefined,
      payerId: nextPayerId,
    },
  });

  await logActivity({
    actorId,
    groupId: receipt.groupId,
    entityId: receipt.id,
    entityType: "RECEIPT",
    action: "RECEIPT_UPDATED",
    before: receipt,
    after: updated,
  });

  return updated;
};

const ensureLineItemsBalanced = (receipt: Prisma.ReceiptGetPayload<{ include: { lineItems: { include: { assignments: true } } } }>) => {
  const lineItemSum = sumDecimals(receipt.lineItems.map((item) => item.subtotal));
  const total = receipt.totalAmount;

  if (!lineItemSum.equals(total)) {
    throw new ValidationError("Receipt totals do not match line items");
  }

  const uncategorized = receipt.lineItems.filter((item) => !item.categoryId);

  if (uncategorized.length > 0) {
    throw new ValidationError("All line items must have a category before confirmation");
  }
};

export const confirmReceipt = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: ConfirmReceiptInput;
}) => {
  const payload = confirmReceiptSchema.parse(input);

  const receipt = await getReceiptOrThrow(payload.receiptId);

  await requireGroupRole(receipt.groupId, actorId, EDITOR_ROLES);
  requireReceiptEditable(receipt.status);

  ensureLineItemsBalanced(receipt);

  const updated = await prisma.receipt.update({
    where: { id: receipt.id },
    data: {
      status: "ACTIVE",
    },
  });

  await logActivity({
    actorId,
    groupId: updated.groupId,
    entityId: updated.id,
    entityType: "RECEIPT",
    action: "RECEIPT_CONFIRMED",
    before: { status: receipt.status },
    after: { status: updated.status },
  });

  return updated;
};

export const deleteReceipt = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: DeleteReceiptInput;
}) => {
  const payload = deleteReceiptSchema.parse(input);

  const receipt = await prisma.receipt.findUnique({
    where: { id: payload.receiptId },
  });

  if (!receipt) {
    throw new NotFoundError("Receipt not found");
  }

  await requireGroupRole(receipt.groupId, actorId, EDITOR_ROLES);

  const deleted = await prisma.receipt.update({
    where: { id: receipt.id },
    data: {
      deletedAt: new Date(),
      status: "ARCHIVED",
    },
  });

  await logActivity({
    actorId,
    groupId: deleted.groupId,
    entityId: deleted.id,
    entityType: "RECEIPT",
    action: "RECEIPT_DELETED",
    before: receipt,
    after: deleted,
  });

  return deleted;
};

export const getReceiptDetail = async ({
  receiptId,
  actorId,
}: {
  receiptId: string;
  actorId: string;
}) => {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      group: true,
      payer: {
        include: { user: true },
      },
      lineItems: {
        orderBy: { createdAt: "asc" },
        include: {
          category: true,
          assignments: {
            include: {
              member: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!receipt) {
    throw new NotFoundError("Receipt not found");
  }

  await getGroupMemberOrThrow(receipt.groupId, actorId);

  return receipt;
};
