# Group Administration Implementation Guide

Follow this playbook to implement group lifecycle features while respecting multi-tenancy and security requirements described in `architecture.md` and `business-logic.md`.

## Foundational Work
- Extend Clerk integration to expose group membership in `src/lib/auth.ts` (helper for current user roles).
- Define schemas in `src/lib/schemas/groups.ts`: create group, update metadata, invite member, revoke member, delete group.
- Implement services in `src/lib/services/groups.ts`: `createGroup`, `listGroups`, `inviteMember`, `acceptInvitation`, `removeMember`, `deleteGroup` (soft archive).
- Prisma models must include group, membership (role enum), invitations (status, token, expiry).
- Server actions in `src/stack/server.tsx` enforce role-based access control. Use `// 🔒` comments when validating permissions.
- React Query hooks in `src/stack/client.tsx`: `useGroups`, `useGroupInvitations`, `useInviteMember`, `useDeleteGroup`.

## `GroupSwitcher`
1. Place component in `src/components/shared/group-switcher.tsx` for reuse across layout.
2. Use shadcn `Popover` or `Command` to present list of groups with search.
3. Integrate with Zustand store `useGroupStore` storing `currentGroupId`. Update store on selection and trigger React Query cache invalidation via `queryClient.invalidateQueries({ predicate })`.
4. Surface pending invitations section at bottom with accept/decline buttons.
5. Ensure keyboard navigation and ARIA roles for command palette pattern.

## `InviteMembersModal`
1. Component located under `src/app/groups/_components/invite-members-modal.tsx`.
2. Form fields: email, role (viewer/admin), optional message. Use React Hook Form + Zod; support multiple emails via chips.
3. On submit, call `inviteMember` server action. Show success state with copyable invite link.
4. Implement rate limiting via backend service to prevent abuse (store last invite timestamp).
5. Provide status indicator for pending invites (resend, revoke). Use `useGroupInvitations` hook to fetch statuses.

## `GroupRosterPanel`
1. Displays current members, roles, join dates.
2. Provide actions per member: change role, remove, resend invite.
3. Use table layout with responsive stacking on mobile.
4. Changing role triggers `updateMemberRole` server action; ensure optimistic UI with rollback on failure.
5. Removal requires confirmation dialog; cascade updates to feature access (invalidate caches for groups).

## `GroupSettingsPage`
1. Route: `src/app/groups/[groupId]/settings/page.tsx`. Server component fetches metadata, audit info.
2. Client `GroupSettingsForm` allows editing name, avatar, description. Use file upload for avatar with S3 presigned URLs.
3. Integrate `DeleteGroupDialog` button in danger zone section.

## `DeleteGroupDialog`
1. Multi-step confirmation: show summary of data that will be archived, require typing group name to confirm.
2. On confirm, call `deleteGroup` server action (soft delete). Ensure membership revoked, related data flagged as archived.
3. After success, redirect user to group list with toast.
4. Guard against accidental deletion by ensuring only admins can trigger.

## Invitations Lifecycle
- Implement invitation acceptance route `src/app/invitations/[token]/page.tsx`. Validate token, join group, redirect to dashboard.
- Expired tokens should show error and option to request new invite.
- Background job (CRON) to purge expired invites (future enhancement).

## Testing
- Service tests for permission enforcement (non-admin cannot delete, etc.).
- Component tests: group switcher keyboard navigation, invite modal validation, roster actions.
- E2E tests covering create group → invite member → accept invite workflow.
- Manual QA: verify multi-tenancy isolation (user cannot switch to group they are not part of), Clerk session interactions, and deletion cascade behavior.
