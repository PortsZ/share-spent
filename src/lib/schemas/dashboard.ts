import { z } from "zod";
import { cuid, dateRangeSchema } from "./shared";

export const dashboardFiltersSchema = z.object({
  groupId: cuid(),
  participantId: cuid().optional(),
  categoryId: cuid().optional(),
  receiptId: cuid().optional(),
  range: dateRangeSchema.optional(),
});

export const summaryCardSchema = z.object({
  totalExpenses: z.number(),
  totalReceivables: z.number(),
  totalPayables: z.number(),
});

export const participantBalanceSchema = z.object({
  memberId: cuid(),
  displayName: z.string(),
  avatarUrl: z.string().nullish(),
  balance: z.number(),
});

export type DashboardFiltersInput = z.infer<typeof dashboardFiltersSchema>;
export type ParticipantBalance = z.infer<typeof participantBalanceSchema>;
