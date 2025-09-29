import { z } from "zod";
import { cuid, decimalString } from "./shared";
import { lineItemStatusSchema } from "./receipts";

export const lineItemBaseSchema = z.object({
  receiptId: cuid(),
  description: z.string().min(1).max(240),
  quantity: decimalString.default("1"),
  unitPrice: decimalString,
  taxAmount: decimalString.optional(),
  tipAmount: decimalString.optional(),
  categoryId: cuid().optional(),
});

export const createLineItemSchema = lineItemBaseSchema;

export const updateLineItemSchema = lineItemBaseSchema.extend({
  lineItemId: cuid(),
  status: lineItemStatusSchema.optional(),
});

export const deleteLineItemSchema = z.object({
  lineItemId: cuid(),
});

export const lineItemAssignmentSchema = z.object({
  lineItemId: cuid(),
  memberId: cuid(),
  sharePercent: z.number().min(0).max(100).optional(),
  shareAmount: decimalString.optional(),
});

export const bulkAssignmentSchema = z.object({
  assignments: z
    .array(lineItemAssignmentSchema)
    .min(1, "At least one assignment required"),
});

export const manualLineItemSchema = lineItemBaseSchema.extend({
  receiptId: cuid(),
});

export const pendingLineItemsFilterSchema = z.object({
  groupId: cuid(),
  receiptId: cuid().optional(),
  status: lineItemStatusSchema.default("PENDING"),
});

export type CreateLineItemInput = z.infer<typeof createLineItemSchema>;
export type UpdateLineItemInput = z.infer<typeof updateLineItemSchema>;
export type DeleteLineItemInput = z.infer<typeof deleteLineItemSchema>;
export type LineItemAssignmentInput = z.infer<typeof lineItemAssignmentSchema>;
export type BulkAssignmentInput = z.infer<typeof bulkAssignmentSchema>;
export type ManualLineItemInput = z.infer<typeof manualLineItemSchema>;
export type PendingLineItemsFilterInput = z.infer<typeof pendingLineItemsFilterSchema>;
