import { Prisma } from "@prisma/client";

import { prisma } from "../db";
import {
  createLineItemSchema,
  updateLineItemSchema,
  deleteLineItemSchema,
  bulkAssignmentSchema,
  pendingLineItemsFilterSchema,
  type CreateLineItemInput,
  type UpdateLineItemInput,
  type DeleteLineItemInput,
  type BulkAssignmentInput,
  type PendingLineItemsFilterInput,
} from "../schemas/line-items";
import { getReceiptOrThrow } from "./receipts.internal";
import { getGroupMemberOrThrow, requireGroupRole } from "./group-membership";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors";
import { logActivity } from "./activity-log";
import { toDecimal } from "../prisma-helpers";
import { lineItemStatusSchema } from "../schemas/receipts";

const EDITOR_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
const ROUNDING_TOLERANCE = new Prisma.Decimal("0.01");

const computeSubtotal = (quantity: Prisma.Decimal, unitPrice: Prisma.Decimal) =>
  quantity.times(unitPrice);

const validateAssignments = (
  subtotal: Prisma.Decimal,
  assignments: Array<{
    shareAmount?: string;
    sharePercent?: number;
  }>,
) => {
  const amounts = assignments.map((assignment) => {
    if (assignment.shareAmount !== undefined) {
      const amount = toDecimal(assignment.shareAmount);
      if (amount.lessThan(0)) {
        throw new ValidationError("Share amount must be positive");
      }
      return amount;
    }

    if (assignment.sharePercent !== undefined) {
      return subtotal.times(new Prisma.Decimal(assignment.sharePercent).div(100));
    }

    throw new ValidationError("Share amount or percent required");
  });

  const sum = amounts.reduce((acc, value) => acc.plus(value), new Prisma.Decimal(0));

  const diff = sum.minus(subtotal).abs();

  if (diff.greaterThan(ROUNDING_TOLERANCE)) {
    throw new ValidationError("Line item shares must equal subtotal");
  }

  return amounts;
};

export const createLineItem = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: CreateLineItemInput;
}) => {
  const payload = createLineItemSchema.parse(input);

  const receipt = await getReceiptOrThrow(payload.receiptId);

  await requireGroupRole(receipt.groupId, actorId, EDITOR_ROLES);

  const quantity = toDecimal(payload.quantity);
  const unitPrice = toDecimal(payload.unitPrice);
  const subtotal = computeSubtotal(quantity, unitPrice);

  const lineItem = await prisma.lineItem.create({
    data: {
      receiptId: receipt.id,
      description: payload.description,
      quantity,
      unitPrice,
      subtotal,
      categoryId: payload.categoryId ?? null,
    },
  });

  await logActivity({
    actorId,
    groupId: receipt.groupId,
    entityId: lineItem.id,
    entityType: "LINE_ITEM",
    action: "LINE_ITEM_CREATED",
    after: lineItem,
  });

  return lineItem;
};

export const updateLineItem = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: UpdateLineItemInput;
}) => {
  const payload = updateLineItemSchema.parse(input);

  const lineItem = await prisma.lineItem.findUnique({
    where: { id: payload.lineItemId },
    include: { receipt: true },
  });

  if (!lineItem) {
    throw new NotFoundError("Line item not found");
  }

  await requireGroupRole(lineItem.receipt.groupId, actorId, EDITOR_ROLES);

  const nextQuantity = payload.quantity ? toDecimal(payload.quantity) : lineItem.quantity;
  const nextUnitPrice = payload.unitPrice ? toDecimal(payload.unitPrice) : lineItem.unitPrice;
  const subtotal = computeSubtotal(nextQuantity, nextUnitPrice);

  const status = payload.status ? lineItemStatusSchema.parse(payload.status) : lineItem.status;

  const updated = await prisma.lineItem.update({
    where: { id: lineItem.id },
    data: {
      description: payload.description ?? undefined,
      quantity: nextQuantity,
      unitPrice: nextUnitPrice,
      subtotal,
      categoryId: payload.categoryId ?? undefined,
      status,
    },
  });

  await logActivity({
    actorId,
    groupId: lineItem.receipt.groupId,
    entityId: lineItem.id,
    entityType: "LINE_ITEM",
    action: "LINE_ITEM_UPDATED",
    before: lineItem,
    after: updated,
  });

  return updated;
};

export const deleteLineItem = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: DeleteLineItemInput;
}) => {
  const payload = deleteLineItemSchema.parse(input);

  const lineItem = await prisma.lineItem.findUnique({
    where: { id: payload.lineItemId },
    include: { receipt: true },
  });

  if (!lineItem) {
    throw new NotFoundError("Line item not found");
  }

  await requireGroupRole(lineItem.receipt.groupId, actorId, EDITOR_ROLES);

  await prisma.lineItem.update({
    where: { id: payload.lineItemId },
    data: {
      deletedAt: new Date(),
      status: "CANCELLED",
    },
  });

  await prisma.lineItemAssignment.deleteMany({ where: { lineItemId: payload.lineItemId } });

  await logActivity({
    actorId,
    groupId: lineItem.receipt.groupId,
    entityId: lineItem.id,
    entityType: "LINE_ITEM",
    action: "LINE_ITEM_DELETED",
    before: lineItem,
  });

  return { status: "deleted" as const };
};

export const assignLineItemParticipants = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: BulkAssignmentInput;
}) => {
  const payload = bulkAssignmentSchema.parse(input);

  const grouped = payload.assignments.reduce<Record<string, BulkAssignmentInput["assignments"]>>(
    (acc, assignment) => {
      acc[assignment.lineItemId] = acc[assignment.lineItemId] ?? [];
      acc[assignment.lineItemId].push(assignment);
      return acc;
    },
    {},
  );

  for (const [lineItemId, assignments] of Object.entries(grouped)) {
    const lineItem = await prisma.lineItem.findUnique({
      where: { id: lineItemId },
      include: {
        receipt: true,
      },
    });

    if (!lineItem) {
      throw new NotFoundError("Line item not found");
    }

    await requireGroupRole(lineItem.receipt.groupId, actorId, EDITOR_ROLES);

    validateAssignments(lineItem.subtotal, assignments);

    await prisma.$transaction(async (tx) => {
      const memberIds = assignments.map((assignment) => assignment.memberId);

      const members = await tx.groupMember.findMany({
        where: {
          id: { in: memberIds },
          groupId: lineItem.receipt.groupId,
        },
      });

      if (members.length !== memberIds.length) {
        throw new ForbiddenError("Assignment includes invalid group member");
      }

      await tx.lineItemAssignment.deleteMany({ where: { lineItemId } });

      await Promise.all(
        assignments.map((assignment) =>
          tx.lineItemAssignment.create({
            data: {
              lineItemId,
              memberId: assignment.memberId,
              shareAmount:
                assignment.shareAmount !== undefined
                  ? toDecimal(assignment.shareAmount)
                  : null,
              sharePercent:
                assignment.sharePercent !== undefined
                  ? new Prisma.Decimal(assignment.sharePercent)
                  : null,
            },
          }),
        ),
      );

      await logActivity({
        actorId,
        groupId: lineItem.receipt.groupId,
        entityId: lineItem.id,
        entityType: "LINE_ITEM",
        action: "LINE_ITEM_ASSIGNED",
        after: { assignments },
        client: tx,
      });
    });
  }

  return { status: "assigned" as const };
};

export const listPendingLineItems = async (
  input: PendingLineItemsFilterInput & { actorId: string },
) => {
  const payload = pendingLineItemsFilterSchema.parse(input);

  await getGroupMemberOrThrow(payload.groupId, input.actorId);

  return prisma.lineItem.findMany({
    where: {
      receipt: {
        groupId: payload.groupId,
      },
      deletedAt: null,
      status: payload.status,
      receiptId: payload.receiptId ?? undefined,
    },
    orderBy: { createdAt: "asc" },
    include: {
      receipt: true,
      category: true,
      assignments: {
        include: {
          member: {
            include: { user: true },
          },
        },
      },
    },
  });
};
