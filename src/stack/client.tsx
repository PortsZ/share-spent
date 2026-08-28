"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

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
import type {
  ListNotificationsInput,
  MarkNotificationReadInput,
} from "../lib/schemas/notifications";
import {
  assignLineItemParticipantsAction,
  createCategoryAction,
  createGroupAction,
  createLineItemAction,
  createReceiptAction,
  deleteCategoryAction,
  deleteGroupAction,
  deleteLineItemAction,
  deleteReceiptAction,
  listCategoriesAction,
  listGroupsAction,
  listNotificationsAction,
  listPaymentHistoryAction,
  listPendingLineItemsAction,
  listPendingPaymentsAction,
  listReceiptsAction,
  getReceiptDetailAction,
  markNotificationReadAction,
  recordPaymentAction,
  confirmPaymentAction,
  rejectPaymentAction,
  updateCategoryAction,
  updateGroupAction,
  updateLineItemAction,
  updateReceiptAction,
  inviteMemberAction,
  respondInvitationAction,
  changeMemberRoleAction,
  removeMemberAction,
  archiveCategoryAction,
  reassignCategoryAction,
  confirmReceiptAction,
} from "./server";

const serialize = <T extends object>(value: T) => JSON.stringify(value, (_, v) => {
  if (v instanceof Date) {
    return v.toISOString();
  }
  return v;
});

export const queryKeys = {
  groups: ["groups"] as const,
  categories: (groupId: string, includeArchived = false) =>
    ["categories", groupId, includeArchived] as const,
  receipts: (filters: ReceiptFiltersInput) =>
    ["receipts", serialize(filters)] as const,
  receiptDetail: (receiptId: string) => ["receipt", receiptId] as const,
  pendingLineItems: (filters: PendingLineItemsFilterInput) =>
    ["pending-line-items", serialize(filters)] as const,
  pendingPayments: (filters: PendingPaymentsFilterInput) =>
    ["pending-payments", serialize(filters)] as const,
  paymentHistory: (filters: PaymentHistoryFilterInput) =>
    ["payment-history", serialize(filters)] as const,
  notifications: (filters: Omit<ListNotificationsInput, "userId">) =>
    ["notifications", serialize(filters)] as const,
};

export const useGroupsQuery = (options?: UseQueryOptions<Awaited<ReturnType<typeof listGroupsAction>>>) =>
  useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => listGroupsAction(),
    ...options,
  });

export const useCreateGroupMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof createGroupAction>>, unknown, CreateGroupInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) => createGroupAction(input),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUpdateGroupMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof updateGroupAction>>, unknown, UpdateGroupInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGroupInput) => updateGroupAction(input),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useDeleteGroupMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof deleteGroupAction>>, unknown, DeleteGroupInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteGroupInput) => deleteGroupAction(input),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useInviteMemberMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof inviteMemberAction>>, unknown, InviteMemberInput>,
) =>
  useMutation({
    mutationFn: (input: InviteMemberInput) => inviteMemberAction(input),
    ...options,
  });

export const useRespondInvitationMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof respondInvitationAction>>, unknown, RespondInvitationInput>,
) =>
  useMutation({
    mutationFn: (input: RespondInvitationInput) => respondInvitationAction(input),
    ...options,
  });

export const useChangeMemberRoleMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof changeMemberRoleAction>>, unknown, ChangeMemberRoleInput>,
) =>
  useMutation({
    mutationFn: (input: ChangeMemberRoleInput) => changeMemberRoleAction(input),
    ...options,
  });

export const useRemoveMemberMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof removeMemberAction>>, unknown, RemoveMemberInput>,
) =>
  useMutation({
    mutationFn: (input: RemoveMemberInput) => removeMemberAction(input),
    ...options,
  });

export const useCategoriesQuery = (
  groupId: string | null,
  includeArchived = false,
  options?: UseQueryOptions<Awaited<ReturnType<typeof listCategoriesAction>>>,
) =>
  useQuery({
    queryKey: groupId ? queryKeys.categories(groupId, includeArchived) : ["categories"] as const,
    queryFn: () => {
      if (!groupId) {
        return Promise.resolve([]);
      }
      return listCategoriesAction(groupId, includeArchived);
    },
    enabled: Boolean(groupId) && (options?.enabled ?? true),
    ...options,
  });

export const useCreateCategoryMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof createCategoryAction>>, unknown, CreateCategoryInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategoryAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) && queryKey[0] === "categories" && queryKey[1] === variables.groupId,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateCategoryMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof updateCategoryAction>>, unknown, UpdateCategoryInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategoryAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) && queryKey[0] === "categories" && queryKey[1] === data.groupId,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useArchiveCategoryMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof archiveCategoryAction>>, unknown, ArchiveCategoryInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ArchiveCategoryInput) => archiveCategoryAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) && queryKey[0] === "categories" && queryKey[1] === data.groupId,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteCategoryMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategoryAction>>, unknown, DeleteCategoryInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCategoryInput) => deleteCategoryAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) && queryKey[0] === "categories" && queryKey[1] === data.groupId,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useReassignCategoryMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof reassignCategoryAction>>, unknown, ReassignCategoryInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReassignCategoryInput) => reassignCategoryAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) && queryKey[0] === "categories" && queryKey[1] === data.groupId,
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useReceiptsQuery = (
  filters: ReceiptFiltersInput | null,
  options?: UseQueryOptions<Awaited<ReturnType<typeof listReceiptsAction>>>,
) =>
  useQuery({
    queryKey: filters ? queryKeys.receipts(filters) : ["receipts"] as const,
    queryFn: () => {
      if (!filters) {
        return Promise.resolve([]);
      }
      return listReceiptsAction(filters);
    },
    enabled: Boolean(filters) && (options?.enabled ?? true),
    ...options,
  });

export const useReceiptDetailQuery = (
  receiptId: string | null,
  options?: UseQueryOptions<Awaited<ReturnType<typeof getReceiptDetailAction>> | null>,
) =>
  useQuery({
    queryKey: receiptId ? queryKeys.receiptDetail(receiptId) : ["receipt"] as const,
    queryFn: () => {
      if (!receiptId) {
        return Promise.resolve(null);
      }
      return getReceiptDetailAction({ receiptId } satisfies ReceiptIdInput);
    },
    enabled: Boolean(receiptId) && (options?.enabled ?? true),
    ...options,
  });

export const useCreateReceiptMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof createReceiptAction>>, unknown, CreateReceiptInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReceiptInput) => createReceiptAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "receipts",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateReceiptMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof updateReceiptAction>>, unknown, UpdateReceiptInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateReceiptInput) => updateReceiptAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.receiptDetail(variables.receiptId) });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "receipts",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useConfirmReceiptMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof confirmReceiptAction>>, unknown, ConfirmReceiptInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfirmReceiptInput) => confirmReceiptAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.receiptDetail(variables.receiptId) });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "receipts",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteReceiptMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof deleteReceiptAction>>, unknown, DeleteReceiptInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteReceiptInput) => deleteReceiptAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "receipts",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useCreateLineItemMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof createLineItemAction>>, unknown, CreateLineItemInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLineItemInput) => createLineItemAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.receiptDetail(variables.receiptId) });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-line-items",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateLineItemMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof updateLineItemAction>>, unknown, UpdateLineItemInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLineItemInput) => updateLineItemAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.receiptDetail(variables.receiptId) });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-line-items",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteLineItemMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof deleteLineItemAction>>, unknown, DeleteLineItemInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteLineItemInput) => deleteLineItemAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "receipt",
      });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-line-items",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useAssignParticipantsMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof assignLineItemParticipantsAction>>, unknown, BulkAssignmentInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkAssignmentInput) => assignLineItemParticipantsAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "receipt",
      });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-line-items",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const usePendingLineItemsQuery = (
  filters: PendingLineItemsFilterInput | null,
  options?: UseQueryOptions<Awaited<ReturnType<typeof listPendingLineItemsAction>>>,
) =>
  useQuery({
    queryKey: filters ? queryKeys.pendingLineItems(filters) : ["pending-line-items"] as const,
    queryFn: () => {
      if (!filters) {
        return Promise.resolve([]);
      }
      return listPendingLineItemsAction(filters);
    },
    enabled: Boolean(filters) && (options?.enabled ?? true),
    ...options,
  });

export const useRecordPaymentMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof recordPaymentAction>>, unknown, RecordPaymentInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordPaymentInput) => recordPaymentAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-payments",
      });
      if (variables.receiptId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.receiptDetail(variables.receiptId) });
      }
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "payment-history",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useConfirmPaymentMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof confirmPaymentAction>>, unknown, ConfirmPaymentInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfirmPaymentInput) => confirmPaymentAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-payments",
      });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "payment-history",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useRejectPaymentMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof rejectPaymentAction>>, unknown, RejectPaymentInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RejectPaymentInput) => rejectPaymentAction(input),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "pending-payments",
      });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "payment-history",
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const usePendingPaymentsQuery = (
  filters: PendingPaymentsFilterInput | null,
  options?: UseQueryOptions<Awaited<ReturnType<typeof listPendingPaymentsAction>>>,
) =>
  useQuery({
    queryKey: filters ? queryKeys.pendingPayments(filters) : ["pending-payments"] as const,
    queryFn: () => {
      if (!filters) {
        return Promise.resolve([]);
      }
      return listPendingPaymentsAction(filters);
    },
    enabled: Boolean(filters) && (options?.enabled ?? true),
    ...options,
  });

export const usePaymentHistoryQuery = (
  filters: PaymentHistoryFilterInput | null,
  options?: UseQueryOptions<Awaited<ReturnType<typeof listPaymentHistoryAction>>>,
) =>
  useQuery({
    queryKey: filters ? queryKeys.paymentHistory(filters) : ["payment-history"] as const,
    queryFn: () => {
      if (!filters) {
        return Promise.resolve({ items: [], nextCursor: null });
      }
      return listPaymentHistoryAction(filters);
    },
    enabled: Boolean(filters) && (options?.enabled ?? true),
    ...options,
  });

export const useNotificationsQuery = (
  filters: Omit<ListNotificationsInput, "userId"> | null,
  options?: UseQueryOptions<Awaited<ReturnType<typeof listNotificationsAction>>>,
) =>
  useQuery({
    queryKey: filters ? queryKeys.notifications(filters) : ["notifications"] as const,
    queryFn: () => {
      const payload = (filters ?? {}) as Omit<ListNotificationsInput, "userId">;
      return listNotificationsAction(payload);
    },
    ...options,
  });

export const useMarkNotificationReadMutation = (
  options?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationReadAction>>, unknown, MarkNotificationReadInput>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MarkNotificationReadInput) => markNotificationReadAction(input),
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === "notifications",
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
