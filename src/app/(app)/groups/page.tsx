"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import {
  useCreateGroupMutation,
  useGroupsQuery,
  useInviteMemberMutation,
} from "../../../stack/client";
import { useActiveGroup } from "../../../lib/stores/active-group";
import { Button } from "../../../components/ui/button";
import { Card, CardSubtitle, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { FieldError, Input, Label } from "../../../components/ui/field";
import { EmptyState, ErrorState, SkeletonList } from "../../../components/ui/states";

const CreateGroupForm = ({ onDone }: { onDone: () => void }) => {
  const [name, setName] = useState("");
  const createGroup = useCreateGroupMutation({ onSuccess: onDone });

  return (
    <Card className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) {
            return;
          }
          createGroup.mutate({ name: name.trim() });
        }}
      >
        <div>
          <Label htmlFor="group-name">Group name</Label>
          <Input
            id="group-name"
            value={name}
            autoFocus
            maxLength={120}
            placeholder="Apartment 4B"
            onChange={(event) => setName(event.target.value)}
          />
          <FieldError>
            {createGroup.error instanceof Error ? createGroup.error.message : undefined}
          </FieldError>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={createGroup.isPending || !name.trim()}>
            {createGroup.isPending ? "Creating…" : "Create group"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

const InviteForm = ({ groupId }: { groupId: string }) => {
  const [email, setEmail] = useState("");
  const invite = useInviteMemberMutation({ onSuccess: () => setEmail("") });

  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) {
          return;
        }
        invite.mutate({ groupId, email: email.trim(), role: "MEMBER" });
      }}
    >
      <label htmlFor={`invite-${groupId}`} className="sr-only">
        Invite by email
      </label>
      <Input
        id={`invite-${groupId}`}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="name@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit" variant="secondary" disabled={invite.isPending || !email.trim()}>
        {invite.isPending ? "Inviting…" : "Invite"}
      </Button>
    </form>
  );
};

export default function GroupsPage() {
  const { data: groups, isPending, error, refetch } = useGroupsQuery();
  const { groupId, setGroupId } = useActiveGroup();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">Groups</h1>
        {!creating ? (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden />
            New
          </Button>
        ) : null}
      </div>

      {creating ? <CreateGroupForm onDone={() => setCreating(false)} /> : null}

      {isPending ? <SkeletonList /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}

      {groups?.length === 0 && !creating ? (
        <EmptyState
          title="No groups yet"
          description="Create your first group, then invite the people you split with."
          action={<Button onClick={() => setCreating(true)}>Create a group</Button>}
        />
      ) : null}

      <ul className="space-y-3">
        {groups?.map((group) => (
          <li key={group.id}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{group.name}</CardTitle>
                  {group.description ? (
                    <CardSubtitle className="line-clamp-2">
                      {group.description}
                    </CardSubtitle>
                  ) : null}
                </div>
                <Badge tone={group.role === "OWNER" ? "success" : "neutral"}>
                  {group.role.toLowerCase()}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant={group.id === groupId ? "primary" : "secondary"}
                  onClick={() => setGroupId(group.id)}
                >
                  <Users className="size-4" aria-hidden />
                  {group.id === groupId ? "Active" : "Set active"}
                </Button>
              </div>

              {group.role !== "MEMBER" ? <InviteForm groupId={group.id} /> : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
