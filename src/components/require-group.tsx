"use client";

import Link from "next/link";

import { useActiveGroup } from "../lib/stores/active-group";
import { useGroupsQuery } from "../stack/client";
import { buttonVariants } from "./ui/button-variants";
import { EmptyState, ErrorState, SkeletonList } from "./ui/states";

/**
 * Every tab except Groups needs an active group. This centralises the
 * loading / no-group / error branches so each page can assume a groupId.
 */
export const RequireGroup = ({
  children,
}: {
  children: (groupId: string) => React.ReactNode;
}) => {
  const { data: groups, isPending, error, refetch } = useGroupsQuery();
  const groupId = useActiveGroup((state) => state.groupId);

  if (isPending) {
    return <SkeletonList />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (!groups?.length) {
    return (
      <EmptyState
        title="No groups yet"
        description="Create a group to start splitting receipts with roommates and friends."
        action={
          <Link href="/groups" className={buttonVariants()}>
            Go to groups
          </Link>
        }
      />
    );
  }

  const active = groupId ?? groups[0].id;

  return <>{children(active)}</>;
};
