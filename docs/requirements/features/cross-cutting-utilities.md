# Cross-Cutting Utilities Implementation Guide

These utilities support multiple features. Follow the coding rules and workflows when implementing shared components and services.

## `NotificationsCenter`
1. Place component at `src/app/(app)/_components/notifications-center.tsx`. Render as dropdown/panel accessible from top navigation.
2. Data model: create `src/lib/schemas/notifications.ts` for message types (receipt processing, pending approvals, payment requests).
3. Service functions in `src/lib/services/notifications.ts` for fetching, marking read, and subscription management.
4. Server actions `listNotifications`, `markNotificationRead`, `subscribeToChannel` in `src/stack/server.tsx` secured by Clerk.
5. Use TanStack Query with WebSocket/SSE (future). Initially poll every 60s using `useInterval` hook respecting tab visibility.
6. Ensure accessibility: role="log", focus management when opening dropdown, keyboard navigation.

## `ActivityLogTimeline`
1. Shared component in `src/components/features/activity-log-timeline.tsx` for reuse across receipts, payments, categories.
2. Data schema defined in `src/lib/schemas/activity-log.ts`. Include actor, timestamp, entity type, before/after details.
3. Fetch data via `useActivityLog` hook (React Query). Support pagination with `useInfiniteQuery`.
4. Render timeline with shadcn `Timeline` or custom vertical list. Provide filters (entity type, date range).
5. Highlight critical actions with icons and color coding. Use tooltips for before/after diffs.
6. Provide export to CSV via server action when needed.

## `GlobalSearchBar` (optional stretch)
1. Component under `src/components/shared/global-search-bar.tsx`. Implement command palette pattern.
2. Data sources: receipts, line items, members. Build unified search API `src/app/api/v1/search/route.ts` if required.
3. Use debounced input, call server action returning grouped results. Display categories with icons, highlight matches.
4. Keyboard-first UX: open via `Cmd+K`. Manage focus trapping and ARIA attributes.
5. Lazy load component using `next/dynamic` to avoid adding to main bundle unless used.

## Shared Hooks & Stores
- `useToast` already available? Ensure global provider configured. Provide success/error conventions (prefix message with feature).
- Create `useHotkeys` hook in `src/lib/hooks/use-hotkeys.ts` to register keyboard shortcuts with cleanup (♻️ state sync comment when necessary).
- Build `useOutstandingBalances` hook to centralize balance calculations for receipts and payments.

## Observability & Error Handling
- Integrate Sentry capture in server actions for unexpected failures. Annotate with `// 🔌 external integration` when touching services.
- Provide fallback UI (`ErrorBoundary`) for each feature area. Shared boundary component should live in `src/components/shared/error-boundary.tsx`.
- Document recovery steps in toast/notifications for users when errors occur (retry, contact support).

## Testing & Maintenance
- Shared utilities require dedicated unit tests (e.g., hook behavior). Place in `__tests__` mirror directories.
- Ensure components remain generic; avoid feature-specific logic leaking in.
- Update documentation whenever utility contracts change, referencing dependent features.
