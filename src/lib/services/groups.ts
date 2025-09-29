import crypto from "node:crypto";

import { prisma } from "../db";
import {
  createGroupSchema,
  inviteMemberSchema,
  respondInvitationSchema,
  changeMemberRoleSchema,
  removeMemberSchema,
  deleteGroupSchema,
  updateGroupSchema,
  type CreateGroupInput,
  type InviteMemberInput,
  type RespondInvitationInput,
  type ChangeMemberRoleInput,
  type RemoveMemberInput,
  type DeleteGroupInput,
  type UpdateGroupInput,
} from "../schemas/groups";
import { ForbiddenError, NotFoundError } from "../errors";
import { logActivity } from "./activity-log";
import {
  getGroupMemberOrThrow,
  requireGroupRole,
  type GroupRole,
} from "./group-membership";

const OWNER_ROLES: ReadonlyArray<GroupRole> = ["OWNER", "ADMIN"];

export const createGroup = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: CreateGroupInput;
}) => {
  const payload = createGroupSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: payload.name,
        description: payload.description ?? null,
        avatarUrl: payload.avatarUrl ?? null,
        members: {
          create: {
            userId: actorId,
            role: "OWNER",
          },
        },
      },
    });

    await logActivity({
      actorId,
      groupId: group.id,
      entityId: group.id,
      entityType: "GROUP",
      action: "GROUP_CREATED",
      after: { name: group.name },
      client: tx,
    });

    return group;
  });

  return result;
};

export const listGroupsForUser = async (userId: string) => {
  const groups = await prisma.groupMember.findMany({
    where: { userId, group: { archivedAt: null } },
    include: {
      group: true,
    },
    orderBy: {
      group: { createdAt: "desc" },
    },
  });

  return groups.map(({ group, role }) => ({
    ...group,
    role,
  }));
};

export const updateGroup = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: UpdateGroupInput;
}) => {
  const payload = updateGroupSchema.parse(input);

  await requireGroupRole(payload.groupId, actorId, OWNER_ROLES);

  const existing = await prisma.group.findUnique({
    where: { id: payload.groupId },
  });

  if (!existing) {
    throw new NotFoundError("Group not found");
  }

  const updated = await prisma.group.update({
    where: { id: payload.groupId },
    data: {
      name: payload.name ?? undefined,
      description: payload.description ?? undefined,
      avatarUrl: payload.avatarUrl ?? undefined,
    },
  });

  await logActivity({
    actorId,
    groupId: updated.id,
    entityId: updated.id,
    entityType: "GROUP",
    action: "GROUP_UPDATED",
    before: existing,
    after: updated,
  });

  return updated;
};

const buildInviteToken = () => crypto.randomUUID();

export const inviteMember = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: InviteMemberInput;
}) => {
  const payload = inviteMemberSchema.parse(input);

  const actorMember = await requireGroupRole(payload.groupId, actorId, OWNER_ROLES);

  const invitation = await prisma.groupInvitation.create({
    data: {
      groupId: payload.groupId,
      email: payload.email.toLowerCase(),
      role: payload.role,
      token: buildInviteToken(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      invitedById: actorMember.id,
    },
  });

  await logActivity({
    actorId,
    groupId: payload.groupId,
    entityId: invitation.id,
    entityType: "INVITATION",
    action: "INVITE_SENT",
    after: {
      email: invitation.email,
      role: invitation.role,
    },
  });

  return invitation;
};

export const respondToInvitation = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: RespondInvitationInput;
}) => {
  const payload = respondInvitationSchema.parse(input);

  const invitation = await prisma.groupInvitation.findUnique({
    where: { token: payload.token },
  });

  if (!invitation || invitation.status !== "PENDING") {
    throw new NotFoundError("Invitation not found");
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });

    throw new ForbiddenError("Invitation expired");
  }

  if (!payload.accept) {
    await prisma.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: "REVOKED" },
    });

    return { status: "declined" as const };
  }

  const result = await prisma.$transaction(async (tx) => {
    const groupMember = await tx.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId: invitation.groupId,
          userId: actorId,
        },
      },
      update: {
        role: invitation.role,
      },
      create: {
        groupId: invitation.groupId,
        userId: actorId,
        role: invitation.role,
      },
    });

    await tx.groupInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    await logActivity({
      actorId,
      groupId: invitation.groupId,
      entityId: groupMember.id,
      entityType: "GROUP",
      action: "INVITE_ACCEPTED",
      after: { role: groupMember.role },
      client: tx,
    });

    return groupMember;
  });

  return { status: "accepted" as const, member: result };
};

export const changeMemberRole = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: ChangeMemberRoleInput;
}) => {
  const payload = changeMemberRoleSchema.parse(input);

  const actorMember = await requireGroupRole(payload.groupId, actorId, OWNER_ROLES);

  if (actorMember.id === payload.memberId) {
    throw new ForbiddenError("Cannot change your own role");
  }

  const target = await prisma.groupMember.findUnique({
    where: { id: payload.memberId },
  });

  if (!target || target.groupId !== payload.groupId) {
    throw new NotFoundError("Member not found");
  }

  const updated = await prisma.groupMember.update({
    where: { id: payload.memberId },
    data: { role: payload.role },
  });

  await logActivity({
    actorId,
    groupId: payload.groupId,
    entityId: updated.id,
    entityType: "GROUP",
    action: "MEMBER_ROLE_UPDATED",
    before: { role: target.role },
    after: { role: updated.role },
  });

  return updated;
};

export const removeMember = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: RemoveMemberInput;
}) => {
  const payload = removeMemberSchema.parse(input);

  const actorMember = await requireGroupRole(payload.groupId, actorId, OWNER_ROLES);

  if (actorMember.id === payload.memberId) {
    throw new ForbiddenError("Owners cannot remove themselves");
  }

  const target = await prisma.groupMember.findUnique({
    where: { id: payload.memberId },
    include: { receiptsAsPayer: true },
  });

  if (!target || target.groupId !== payload.groupId) {
    throw new NotFoundError("Member not found");
  }

  if (target.receiptsAsPayer.length > 0) {
    throw new ForbiddenError("Member has receipts and cannot be removed");
  }

  await prisma.groupMember.delete({
    where: { id: payload.memberId },
  });

  await logActivity({
    actorId,
    groupId: payload.groupId,
    entityId: payload.memberId,
    entityType: "GROUP",
    action: "MEMBER_REMOVED",
    before: { memberId: payload.memberId },
  });

  return { status: "removed" as const };
};

export const deleteGroup = async ({
  actorId,
  input,
}: {
  actorId: string;
  input: DeleteGroupInput;
}) => {
  const payload = deleteGroupSchema.parse(input);

  const actorMember = await getGroupMemberOrThrow(payload.groupId, actorId);
  if (actorMember.role !== "OWNER") {
    throw new ForbiddenError("Only owners can delete groups");
  }

  const group = await prisma.group.update({
    where: { id: payload.groupId },
    data: { archivedAt: new Date() },
  });

  await logActivity({
    actorId,
    groupId: payload.groupId,
    entityId: payload.groupId,
    entityType: "GROUP",
    action: "GROUP_ARCHIVED",
    before: { archivedAt: null },
    after: { archivedAt: group.archivedAt },
  });

  return group;
};
