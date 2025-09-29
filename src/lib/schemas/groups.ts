import { z } from "zod";
import { cuid } from "./shared";

export const groupPlanSchema = z.enum(["FREE", "PRO"]);

export const groupRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);

export const invitationStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REVOKED",
  "EXPIRED",
]);

export const createGroupSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1024).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateGroupSchema = createGroupSchema.partial().extend({
  groupId: cuid(),
});

export const inviteMemberSchema = z.object({
  groupId: cuid(),
  email: z.string().email(),
  role: groupRoleSchema.default("MEMBER"),
});

export const respondInvitationSchema = z.object({
  token: z.string().min(1),
  accept: z.boolean(),
});

export const changeMemberRoleSchema = z.object({
  groupId: cuid(),
  memberId: cuid(),
  role: groupRoleSchema,
});

export const removeMemberSchema = z.object({
  groupId: cuid(),
  memberId: cuid(),
});

export const deleteGroupSchema = z.object({
  groupId: cuid(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;
export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type DeleteGroupInput = z.infer<typeof deleteGroupSchema>;
