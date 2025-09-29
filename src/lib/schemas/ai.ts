import { z } from "zod";
import { cuid } from "./shared";

export const aiParseStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED"]);

export const createParseRequestSchema = z.object({
  receiptId: cuid(),
  payload: z.record(z.unknown()),
});

export const updateParseResultSchema = z.object({
  receiptId: cuid(),
  status: aiParseStatusSchema,
  response: z.record(z.unknown()).optional(),
  errorMessage: z.string().optional(),
});

export type CreateParseRequestInput = z.infer<typeof createParseRequestSchema>;
export type UpdateParseResultInput = z.infer<typeof updateParseResultSchema>;
