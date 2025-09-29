import { z } from "zod";
import { cuid, decimalString, dateRangeSchema } from "./shared";

export const receiptStatusSchema = z.enum([
  "PROCESSING",
  "PENDING_REVIEW",
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const lineItemStatusSchema = z.enum([
  "PENDING",
  "MATCHED",
  "REVIEWED",
  "CANCELLED",
]);

export const paymentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "REJECTED",
]);

export const uploadReceiptSchema = z.object({
  groupId: cuid(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024),
  notes: z.string().max(2000).optional(),
});

export const createReceiptSchema = z.object({
  groupId: cuid(),
  merchantName: z.string().max(200).optional(),
  receiptDate: z.coerce.date().optional(),
  totalAmount: decimalString,
  currency: z.string().length(3),
  taxAmount: decimalString.optional(),
  tipAmount: decimalString.optional(),
  payerId: cuid().optional(),
  notes: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateReceiptSchema = createReceiptSchema.extend({
  receiptId: cuid(),
});

export const confirmReceiptSchema = z.object({
  receiptId: cuid(),
});

export const deleteReceiptSchema = z.object({
  receiptId: cuid(),
});

export const receiptFiltersSchema = z.object({
  groupId: cuid(),
  status: receiptStatusSchema.optional(),
  payerId: cuid().optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  range: dateRangeSchema.optional(),
});

export const receiptIdSchema = z.object({
  receiptId: cuid(),
});

export type UploadReceiptInput = z.infer<typeof uploadReceiptSchema>;
export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;
export type ConfirmReceiptInput = z.infer<typeof confirmReceiptSchema>;
export type DeleteReceiptInput = z.infer<typeof deleteReceiptSchema>;
export type ReceiptFiltersInput = z.infer<typeof receiptFiltersSchema>;
export type ReceiptIdInput = z.infer<typeof receiptIdSchema>;
