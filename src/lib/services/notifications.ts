import { prisma } from "../db";
import {
  listNotificationsSchema,
  markNotificationReadSchema,
  type ListNotificationsInput,
  type MarkNotificationReadInput,
} from "../schemas/notifications";
import { paginationSchema } from "../schemas/shared";
import { notificationTypeSchema } from "../schemas/notifications";
import { z } from "zod";

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export type CreateNotificationInput = {
  userId: string;
  groupId?: string | null;
  entityId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
};

export const createNotification = async (input: CreateNotificationInput) => {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      groupId: input.groupId ?? null,
      entityId: input.entityId ?? null,
      type: input.type,
      title: input.title,
      message: input.message,
    },
  });
};

export const listNotifications = async (input: ListNotificationsInput) => {
  const payload = listNotificationsSchema.parse(input);
  const pagination = paginationSchema.parse({ cursor: payload.cursor, limit: payload.limit });

  const items = await prisma.notification.findMany({
    where: {
      userId: payload.userId,
      groupId: payload.groupId ?? undefined,
      readAt: payload.unreadOnly ? null : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: pagination.limit + 1,
    cursor: payload.cursor ? { id: payload.cursor } : undefined,
  });

  const hasMore = items.length > pagination.limit;

  return {
    items: hasMore ? items.slice(0, pagination.limit) : items,
    nextCursor: hasMore ? items[pagination.limit].id : null,
  };
};

export const markNotificationRead = async (input: MarkNotificationReadInput) => {
  const payload = markNotificationReadSchema.parse(input);

  return prisma.notification.update({
    where: { id: payload.notificationId },
    data: { readAt: new Date() },
  });
};
