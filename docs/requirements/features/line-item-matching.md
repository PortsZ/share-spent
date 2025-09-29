# Line Item Matching Implementation Guide

This document details the build steps for matching and resolving receipt line items. Follow coding standards in `docs/coding-rules.md` and workflows in `docs/workflow-frontend-component.md` and `docs/workflow-feature.md`.

## Domain Prep
- Expand `src/lib/schemas/line-items.ts` with Zod schemas for pending item, participant assignment payloads, manual item creation, and deletion events.
- Implement service utilities in `src/lib/services/line-items.ts` (fetch pending, assign participants, apply shortcuts, audit trail writes).
- Surface server actions in `src/stack/server.tsx`: `resolveLineItem`, `assignParticipants`, `bulkAssign`, `createManualLineItem`, `deleteLineItem`.
- Create React Query hooks in `src/stack/client.tsx`: `usePendingLineItems`, `useLineItemAssignments`, `useBulkShortcut`. Emphasize selector-based Zustand state for UI-only behavior (current selection, keyboard shortcuts, history).

## `PendingLineItemsPanel`
1. Build component in `src/app/line-items/_components/pending-line-items-panel.tsx` with shadcn `Card` layout.
2. Fetch pending items via `usePendingLineItems`. Use suspense boundary with fallback skeleton list.
3. Provide filters (group, receipt, category). Persist state to URL query params for shareable views.
4. Each row uses `LineItemCard` render prop to keep panel lean (<150 LOC).
5. Support bulk selection with checkbox column and `BulkAssignBar` actions that call server `bulkAssign` mutation.

## `LineItemCard`
1. Present card view with description, price, AI confidence indicator, category tag, participant chips.
2. Inject keyboard shortcut hints (e.g., `[A] assign to me`) using `useHotkeys` hook.
3. Inline actions: `Assign`, `Split`, `Delete`, `Mark Reviewed`. Each triggers appropriate mutation with optimistic updates and error rollbacks.
4. Provide status badge (`pending`, `matched`, `needs-review`). Use accessible focus states and allow card navigation via arrow keys.

## `LineItemMatcherPage`
1. Route at `src/app/line-items/matcher/page.tsx`. Server component fetches initial data (receipt snapshot, participants).
2. Client `LineItemMatcher` arranges layout: left column receipt preview, middle item list, right assignment panel.
3. Use CSS grid with responsive breakpoints; degrade gracefully on mobile by stacking sections.
4. Integrate `QuickAssignToolbar` at top with context-aware actions (inactive when nothing selected).
5. Track assignment state in Zustand store to avoid prop drilling; commit changes via debounced mutation.

## `QuickAssignToolbar`
1. Toolbar component using shadcn `Toolbar` pattern.
2. Buttons: `Assign to Me`, `Split Evenly`, `Copy Previous`, `Duplicate Receipt Participants`.
3. Each button triggers specialized helper in `src/lib/services/line-items.ts`. For example, `splitEvenly` calculates shares using business rules; ensure rounding handled deterministically.
4. Display keyboard shortcuts in tooltip, register via `useHotkeys` to call same handler.

## `ManualLineItemForm`
1. Reusable form (modal/drawer) built with React Hook Form + Zod schema from `line-items.ts`.
2. Inputs: description, quantity, unit price, tax flag, category, participants. Provide computed subtotal preview.
3. On submit, call `createManualLineItem`. Optimistically append to local list and sync totals using `ReceiptTotalsSidebar` store.
4. Support editing existing items by preloading default values and calling `updateLineItem` mutation (add to server actions).
5. Tests ensure validation errors, save success, and cancellation flow.

## Shortcut System
- Centralize keyboard mapping in `src/stack/client.tsx` `useLineItemShortcuts` hook. Register/unregister on mount/unmount.
- Ensure shortcuts respect focused inputs; use guard to skip when typing in a text field.
- Provide configuration object to allow future customization per group (persisted via feature flag if needed).

## Audit & Activity
- Every mutation should append to `ActivityLogTimeline` via service layer. Capture actor, action, and before/after values.
- Provide undo for last action (client-side queue). For destructive actions, call `restoreLineItem` server action if supported.

## Testing & QA
- Write happy-path test covering assignment flows, plus regression tests for bulk assign and manual item creation.
- Simulate keyboard shortcuts in tests using `userEvent.keyboard`.
- Validate that state remains consistent when switching receipts, ensuring stores reset on component unmount (see coding rules for ♻️ comments when syncing state).
- Verify accessibility: all controls keyboard reachable, ARIA labels on shortcut buttons, live region for success messages.
