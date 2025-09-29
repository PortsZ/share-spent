import { z } from "zod";
import { cuid } from "./shared";

export const categorySchema = z.object({
  id: cuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(1024).nullish(),
  color: z.string().regex(/^#?[0-9a-f]{3,8}$/i).nullish(),
  icon: z.string().max(64).nullish(),
  isDefault: z.boolean(),
  archivedAt: z.date().nullish(),
});

export const createCategorySchema = z.object({
  groupId: cuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(1024).optional(),
  color: z.string().regex(/^#?[0-9a-f]{3,8}$/i).optional(),
  icon: z.string().max(64).optional(),
});

export const updateCategorySchema = createCategorySchema
  .omit({ groupId: true })
  .extend({
    categoryId: cuid(),
  });

export const archiveCategorySchema = z.object({
  categoryId: cuid(),
  archive: z.boolean().default(true),
});

export const deleteCategorySchema = z.object({
  categoryId: cuid(),
  reassignToCategoryId: cuid().optional(),
});

export const reassignCategorySchema = z.object({
  fromCategoryId: cuid(),
  toCategoryId: cuid(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ArchiveCategoryInput = z.infer<typeof archiveCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type ReassignCategoryInput = z.infer<typeof reassignCategorySchema>;
