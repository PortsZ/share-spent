import { z } from "zod";
import { cuid, paginationSchema } from "./shared";

export const notificationTypeSchema = z.enum([
  "RECEIPT_PROCESSING_FAILED",
  "RECEIPT_READY_FOR_REVIEW",
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "INVITATION_RECEIVED",
]);

export const listNotificationsSchema = z
  .object({
    userId: cuid(),
    groupId: cuid().optional(),
    unreadOnly: z.boolean().optional(),
  })
  .merge(paginationSchema);

export const markNotificationReadSchema = z.object({
  notificationId: cuid(),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
