"use server";

import "server-only";

import { requireAuthContext, getCurrentUser } from "../lib/auth";
import {
  createGroup,
  listGroupsForUser,
  updateGroup,
  inviteMember,
  respondToInvitation,
  changeMemberRole,
  removeMember,
  deleteGroup,
} from "../lib/services/groups";
import {
  createCategory,
  updateCategory,
  archiveCategory,
  deleteCategory,
  reassignCategory,
  listCategories,
} from "../lib/services/categories";
import {
  createReceipt,
  updateReceipt,
  confirmReceipt,
  deleteReceipt,
  listReceipts,
  getReceiptDetail,
} from "../lib/services/receipts";
import {
  createLineItem,
  updateLineItem,
  deleteLineItem,
  assignLineItemParticipants,
  listPendingLineItems,
} from "../lib/services/line-items";
import {
  recordPayment,
  confirmPayment,
  rejectPayment,
  listPendingPayments,
  listPaymentHistory,
} from "../lib/services/payments";
import {
  listNotifications,
  markNotificationRead,
} from "../lib/services/notifications";
import { upsertUserProfile } from "../lib/services/users";
import { getGroupMemberOrThrow } from "../lib/services/group-membership";
import type {
  CreateGroupInput,
  InviteMemberInput,
  RespondInvitationInput,
  ChangeMemberRoleInput,
  RemoveMemberInput,
  DeleteGroupInput,
  UpdateGroupInput,
} from "../lib/schemas/groups";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ArchiveCategoryInput,
  DeleteCategoryInput,
  ReassignCategoryInput,
} from "../lib/schemas/categories";
import type {
  CreateReceiptInput,
  UpdateReceiptInput,
  ConfirmReceiptInput,
  DeleteReceiptInput,
  ReceiptFiltersInput,
  ReceiptIdInput,
} from "../lib/schemas/receipts";
import type {
  CreateLineItemInput,
  UpdateLineItemInput,
  DeleteLineItemInput,
  BulkAssignmentInput,
  PendingLineItemsFilterInput,
} from "../lib/schemas/line-items";
import type {
  RecordPaymentInput,
  ConfirmPaymentInput,
  RejectPaymentInput,
  PendingPaymentsFilterInput,
  PaymentHistoryFilterInput,
} from "../lib/schemas/payments";
import type { MarkNotificationReadInput } from "../lib/schemas/notifications";
import type { ListNotificationsInput } from "../lib/schemas/notifications";

const ensureProfile = async (clerkId: string) => {
  const user = await getCurrentUser();
  await upsertUserProfile({
    clerkId,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    displayName: user.fullName ?? user.username ?? "User",
    avatarUrl: user.imageUrl,
  });
};

export const listGroupsAction = async () => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return listGroupsForUser(context.userId);
};

export const createGroupAction = async (input: CreateGroupInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return createGroup({ actorId: context.userId, input });
};

export const updateGroupAction = async (input: UpdateGroupInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return updateGroup({ actorId: context.userId, input });
};

export const inviteMemberAction = async (input: InviteMemberInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return inviteMember({ actorId: context.userId, input });
};

export const respondInvitationAction = async (input: RespondInvitationInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return respondToInvitation({ actorId: context.userId, input });
};

export const changeMemberRoleAction = async (input: ChangeMemberRoleInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return changeMemberRole({ actorId: context.userId, input });
};

export const removeMemberAction = async (input: RemoveMemberInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return removeMember({ actorId: context.userId, input });
};

export const deleteGroupAction = async (input: DeleteGroupInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return deleteGroup({ actorId: context.userId, input });
};

export const listCategoriesAction = async (groupId: string, includeArchived?: boolean) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  await getGroupMemberOrThrow(groupId, context.userId);
  return listCategories({ groupId, includeArchived });
};

export const createCategoryAction = async (input: CreateCategoryInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return createCategory({ actorId: context.userId, input });
};

export const updateCategoryAction = async (input: UpdateCategoryInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return updateCategory({ actorId: context.userId, input });
};

export const archiveCategoryAction = async (input: ArchiveCategoryInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return archiveCategory({ actorId: context.userId, input });
};

export const deleteCategoryAction = async (input: DeleteCategoryInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return deleteCategory({ actorId: context.userId, input });
};

export const reassignCategoryAction = async (input: ReassignCategoryInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return reassignCategory({ actorId: context.userId, input });
};

export const listReceiptsAction = async (input: ReceiptFiltersInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return listReceipts({ ...input, actorId: context.userId });
};

export const getReceiptDetailAction = async (input: ReceiptIdInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return getReceiptDetail({ receiptId: input.receiptId, actorId: context.userId });
};

export const createReceiptAction = async (input: CreateReceiptInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return createReceipt({ actorId: context.userId, input });
};

export const updateReceiptAction = async (input: UpdateReceiptInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return updateReceipt({ actorId: context.userId, input });
};

export const confirmReceiptAction = async (input: ConfirmReceiptInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return confirmReceipt({ actorId: context.userId, input });
};

export const deleteReceiptAction = async (input: DeleteReceiptInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return deleteReceipt({ actorId: context.userId, input });
};

export const createLineItemAction = async (input: CreateLineItemInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return createLineItem({ actorId: context.userId, input });
};

export const updateLineItemAction = async (input: UpdateLineItemInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return updateLineItem({ actorId: context.userId, input });
};

export const deleteLineItemAction = async (input: DeleteLineItemInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return deleteLineItem({ actorId: context.userId, input });
};

export const assignLineItemParticipantsAction = async (input: BulkAssignmentInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return assignLineItemParticipants({ actorId: context.userId, input });
};

export const listPendingLineItemsAction = async (input: PendingLineItemsFilterInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return listPendingLineItems({ ...input, actorId: context.userId });
};

export const recordPaymentAction = async (input: RecordPaymentInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return recordPayment({ actorId: context.userId, input });
};

export const confirmPaymentAction = async (input: ConfirmPaymentInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return confirmPayment({ actorId: context.userId, input });
};

export const rejectPaymentAction = async (input: RejectPaymentInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return rejectPayment({ actorId: context.userId, input });
};

export const listPendingPaymentsAction = async (input: PendingPaymentsFilterInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return listPendingPayments({ ...input, actorId: context.userId });
};

export const listPaymentHistoryAction = async (input: PaymentHistoryFilterInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return listPaymentHistory({ ...input, actorId: context.userId });
};

export const listNotificationsAction = async (
  input: Omit<ListNotificationsInput, "userId">,
) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return listNotifications({ ...input, userId: context.userId });
};

export const markNotificationReadAction = async (input: MarkNotificationReadInput) => {
  const context = await requireAuthContext();
  await ensureProfile(context.userId);
  return markNotificationRead(input);
};
