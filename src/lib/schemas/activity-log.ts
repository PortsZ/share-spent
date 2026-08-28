import { z } from "zod";
import {
  cuid,
  paginationSchema,
  dateRangeFields,
  dateRangeRefinement,
} from "./shared";

export const activityEntityTypeSchema = z.enum([
  "RECEIPT",
  "LINE_ITEM",
  "PAYMENT",
  "CATEGORY",
  "GROUP",
  "INVITATION",
]);

export const listActivitySchema = z
  .object({
    groupId: cuid(),
    entityId: cuid().optional(),
    entityType: activityEntityTypeSchema.optional(),
    actorId: cuid().optional(),
  })
  .merge(dateRangeFields)
  .merge(paginationSchema)
  .refine(...dateRangeRefinement);

export type ListActivityInput = z.infer<typeof listActivitySchema>;
