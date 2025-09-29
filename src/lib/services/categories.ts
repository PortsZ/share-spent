import { prisma } from "../db";
import {
  createCategorySchema,
  updateCategorySchema,
  archiveCategorySchema,
  deleteCategorySchema,
  reassignCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type ArchiveCategoryInput,
  type DeleteCategoryInput,
  type ReassignCategoryInput,
} from "../schemas/categories";
import { ForbiddenError, NotFoundError } from "../errors";
import { logActivity } from "./activity-log";
import { requireGroupRole } from "./group-membership";

const MANAGER_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

export const listCategories = async ({
  groupId,
  includeArchived = false,
}: {
  groupId: string;
  includeArchived?: boolean;
}) => {
  return prisma.category.findMany({
    where: {
      groupId,
      archivedAt: includeArchived ? undefined : null,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
};

const ensureNameAvailable = async (groupId: string, name: string, excludeId?: string) => {
  const existing = await prisma.category.findFirst({
    where: {
      groupId,
      id: excludeId ? { not: excludeId } : undefined,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new ForbiddenError("Category name already in use");
  }
};

export const createCategory = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: CreateCategoryInput;
}) => {
  const payload = createCategorySchema.parse(input);

  await requireGroupRole(payload.groupId, actorId, MANAGER_ROLES);
  await ensureNameAvailable(payload.groupId, payload.name);

  const category = await prisma.category.create({
    data: {
      groupId: payload.groupId,
      name: payload.name,
      description: payload.description ?? null,
      color: payload.color ?? null,
      icon: payload.icon ?? null,
    },
  });

  await logActivity({
    actorId,
    groupId: payload.groupId,
    entityId: category.id,
    entityType: "CATEGORY",
    action: "CATEGORY_CREATED",
    after: category,
  });

  return category;
};

export const updateCategory = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: UpdateCategoryInput;
}) => {
  const payload = updateCategorySchema.parse(input);

  const existing = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!existing) {
    throw new NotFoundError("Category not found");
  }

  await requireGroupRole(existing.groupId, actorId, MANAGER_ROLES);

  if (payload.name && payload.name !== existing.name) {
    await ensureNameAvailable(existing.groupId, payload.name, existing.id);
  }

  const updated = await prisma.category.update({
    where: { id: payload.categoryId },
    data: {
      name: payload.name ?? undefined,
      description: payload.description ?? undefined,
      color: payload.color ?? undefined,
      icon: payload.icon ?? undefined,
    },
  });

  await logActivity({
    actorId,
    groupId: existing.groupId,
    entityId: existing.id,
    entityType: "CATEGORY",
    action: "CATEGORY_UPDATED",
    before: existing,
    after: updated,
  });

  return updated;
};

export const archiveCategory = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: ArchiveCategoryInput;
}) => {
  const payload = archiveCategorySchema.parse(input);

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  await requireGroupRole(category.groupId, actorId, MANAGER_ROLES);

  const updated = await prisma.category.update({
    where: { id: payload.categoryId },
    data: {
      archivedAt: payload.archive ? new Date() : null,
    },
  });

  await logActivity({
    actorId,
    groupId: category.groupId,
    entityId: category.id,
    entityType: "CATEGORY",
    action: payload.archive ? "CATEGORY_ARCHIVED" : "CATEGORY_RESTORED",
    before: category,
    after: updated,
  });

  return updated;
};

export const deleteCategory = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: DeleteCategoryInput;
}) => {
  const payload = deleteCategorySchema.parse(input);

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
    include: {
      lineItems: { select: { id: true } },
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  if (category.isDefault) {
    throw new ForbiddenError("Default category cannot be deleted");
  }

  await requireGroupRole(category.groupId, actorId, MANAGER_ROLES);

  if (category.lineItems.length > 0 && !payload.reassignToCategoryId) {
    throw new ForbiddenError("Reassign line items before deleting category");
  }

  await prisma.$transaction(async (tx) => {
    if (payload.reassignToCategoryId) {
      await tx.category.findFirstOrThrow({
        where: {
          id: payload.reassignToCategoryId,
          groupId: category.groupId,
        },
      });

      await tx.lineItem.updateMany({
        where: { categoryId: category.id },
        data: { categoryId: payload.reassignToCategoryId },
      });
    }

    await tx.category.delete({
      where: { id: category.id },
    });

    await logActivity({
      actorId,
      groupId: category.groupId,
      entityId: category.id,
      entityType: "CATEGORY",
      action: "CATEGORY_DELETED",
      before: category,
      client: tx,
    });
  });

  return { status: "deleted" as const, groupId: category.groupId };
};

export const reassignCategory = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: ReassignCategoryInput;
}) => {
  const payload = reassignCategorySchema.parse(input);

  if (payload.fromCategoryId === payload.toCategoryId) {
    throw new ForbiddenError("Cannot reassign to the same category");
  }

  const [from, to] = await Promise.all([
    prisma.category.findUnique({ where: { id: payload.fromCategoryId } }),
    prisma.category.findUnique({ where: { id: payload.toCategoryId } }),
  ]);

  if (!from || !to || from.groupId !== to.groupId) {
    throw new NotFoundError("Categories not found in group");
  }

  await requireGroupRole(from.groupId, actorId, MANAGER_ROLES);

  await prisma.lineItem.updateMany({
    where: { categoryId: from.id },
    data: { categoryId: to.id },
  });

  await logActivity({
    actorId,
    groupId: from.groupId,
    entityId: from.id,
    entityType: "CATEGORY",
    action: "CATEGORY_REASSIGNED",
    before: { from: from.id },
    after: { to: to.id },
  });

  return { status: "reassigned" as const, groupId: from.groupId };
};
