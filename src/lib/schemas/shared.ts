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

export const dateRangeSchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(
    (range) => {
      if (!range.from || !range.to) {
        return true;
      }
      return range.from <= range.to;
    },
    { message: "Invalid date range" },
  );

export type PaginationInput = z.infer<typeof paginationSchema>;
