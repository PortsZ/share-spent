import { z } from "zod";
import {
  cuid,
  decimalString,
  paginationSchema,
  dateRangeFields,
  dateRangeRefinement,
} from "./shared";
import { paymentStatusSchema } from "./receipts";

export const recordPaymentSchema = z.object({
  groupId: cuid(),
  receiptId: cuid().optional(),
  payerId: cuid(),
  payeeId: cuid(),
  amount: decimalString,
  currency: z.string().length(3),
  paymentDate: z.coerce.date(),
  lineItemIds: z.array(cuid()).default([]),
  notes: z.string().max(1000).optional(),
});

export const confirmPaymentSchema = z.object({
  paymentId: cuid(),
});

export const rejectPaymentSchema = z.object({
  paymentId: cuid(),
  reason: z.string().max(1000).optional(),
});

export const pendingPaymentsFilterSchema = z.object({
  groupId: cuid(),
  counterpartyId: cuid().optional(),
});

export const paymentHistoryFilterSchema = z
  .object({
    groupId: cuid(),
    participantId: cuid().optional(),
    status: paymentStatusSchema.optional(),
    sort: z.enum(["asc", "desc"]).default("desc"),
  })
  .merge(paginationSchema)
  .merge(dateRangeFields)
  .refine(...dateRangeRefinement);

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
export type PendingPaymentsFilterInput = z.infer<typeof pendingPaymentsFilterSchema>;
export type PaymentHistoryFilterInput = z.infer<typeof paymentHistoryFilterSchema>;
