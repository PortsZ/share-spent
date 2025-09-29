import { prisma } from "../db";
import { ForbiddenError, NotFoundError } from "../errors";
import { groupRoleSchema } from "../schemas/groups";
import { z } from "zod";

export type GroupRole = z.infer<typeof groupRoleSchema>;

export const getGroupMemberOrThrow = async (groupId: string, userId: string) => {
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId },
    },
  });

  if (!member) {
    throw new NotFoundError("Group membership not found");
  }

  return member;
};

export const getGroupMemberByIdOrThrow = async (memberId: string) => {
  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    throw new NotFoundError("Group member not found");
  }

  return member;
};

export const requireGroupRole = async (
  groupId: string,
  userId: string,
  allowedRoles: ReadonlyArray<GroupRole>,
) => {
  const member = await getGroupMemberOrThrow(groupId, userId);

  if (!allowedRoles.includes(member.role)) {
    throw new ForbiddenError("Insufficient permissions for this group");
  }

  return member;
};
