"use client";

import { useEffect } from "react";

import { useGroupsQuery } from "../stack/client";
import { useActiveGroup } from "../lib/stores/active-group";
import { Select } from "./ui/field";

export const GroupSwitcher = () => {
  const { data: groups, isPending } = useGroupsQuery();
  const { groupId, setGroupId } = useActiveGroup();

  // Default to the first group, and recover if the stored group is gone.
  useEffect(() => {
    if (!groups?.length) {
      return;
    }
    if (!groupId || !groups.some((group) => group.id === groupId)) {
      setGroupId(groups[0].id);
    }
  }, [groups, groupId, setGroupId]);

  if (isPending || !groups?.length) {
    return null;
  }

  return (
    <>
      <label htmlFor="group-switcher" className="sr-only">
        Active group
      </label>
      <Select
        id="group-switcher"
        value={groupId ?? ""}
        onChange={(event) => setGroupId(event.target.value)}
        className="min-h-9 max-w-[55%] truncate rounded-lg border-border py-0 text-sm"
      >
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </Select>
    </>
  );
};
