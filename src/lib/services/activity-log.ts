import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../db";
import { activityEntityTypeSchema, type ListActivityInput } from "../schemas/activity-log";
import { paginationSchema } from "../schemas/shared";

export type ActivityEntityType = z.infer<typeof activityEntityTypeSchema>;

type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

export type LogActivityInput = {
  actorId: string;
  groupId: string;
  entityId: string;
  entityType: ActivityEntityType;
  action: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  client?: PrismaClientOrTx;
};

const toJsonInput = (value: Record<string, unknown> | null | undefined) =>
  value == null ? Prisma.DbNull : (value as Prisma.InputJsonObject);

export const logActivity = async ({
  actorId,
  groupId,
  entityId,
  entityType,
  action,
  before,
  after,
  client,
}: LogActivityInput) => {
  const db = client ?? prisma;

  await db.activityLog.create({
    data: {
      actorId,
      groupId,
      entityId,
      entityType,
      action,
      // Prisma needs DbNull (SQL NULL) rather than a bare null for Json? fields.
      before: toJsonInput(before),
      after: toJsonInput(after),
    },
  });
};

export const listActivity = async (input: ListActivityInput) => {
  const parsed = paginationSchema.parse({
    cursor: input.cursor,
    limit: input.limit,
  });

  const items = await prisma.activityLog.findMany({
    where: {
      groupId: input.groupId,
      entityId: input.entityId ?? undefined,
      entityType: input.entityType ?? undefined,
      actorId: input.actorId ?? undefined,
      occurredAt: {
        gte: input.from ?? undefined,
        lte: input.to ?? undefined,
      },
    },
    orderBy: { occurredAt: "desc" },
    take: parsed.limit + 1,
    cursor: input.cursor ? { id: input.cursor } : undefined,
  });

  const hasMore = items.length > parsed.limit;
  const nodes = hasMore ? items.slice(0, parsed.limit) : items;
  const nextCursor = hasMore ? items[parsed.limit].id : null;

  return { nodes, nextCursor };
};
