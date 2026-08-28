import { z } from "zod";

export const cuid = () =>
  z
    .string()
    .min(25)
    .max(32)
    .regex(/^c[a-z0-9]+$/i, "Expected cuid format");

export const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Expected decimal string");

export const moneySchema = z.object({
  amount: decimalString.transform((value) => value),
  currency: z.string().length(3),
});

export const paginationSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().int().min(1).max(100).default(20),
});

// Both fields are already optional, so this object is the "partial" shape that
// filter schemas merge in. `.refine` produces a ZodEffects, which cannot be
// merged, so the range check is exported separately and applied after merging.
export const dateRangeFields = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const isValidDateRange = (range: {
  from?: Date | undefined;
  to?: Date | undefined;
}) => {
  if (!range.from || !range.to) {
    return true;
  }
  return range.from <= range.to;
};

export const dateRangeRefinement = [
  isValidDateRange,
  { message: "Invalid date range" },
] as const;

export const dateRangeSchema = dateRangeFields.refine(...dateRangeRefinement);

export type PaginationInput = z.infer<typeof paginationSchema>;
