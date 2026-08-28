"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ActiveGroupState = {
  groupId: string | null;
  setGroupId: (groupId: string | null) => void;
};

/**
 * Which group the mobile shell is currently scoped to. Persisted so returning
 * to the app on a phone does not drop you back at the group picker.
 */
export const useActiveGroup = create<ActiveGroupState>()(
  persist(
    (set) => ({
      groupId: null,
      setGroupId: (groupId) => set({ groupId }),
    }),
    { name: "sharespent.active-group" },
  ),
);
