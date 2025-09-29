# Receipt Management Implementation Guide

This guide expands the receipt-related feature into actionable implementation steps. Follow the coding, workflow, and architecture rules referenced in `docs/coding-rules.md`, `docs/workflow-feature.md`, and `docs/workflow-frontend-component.md`.

## Shared Prep
- Define `receipt` data contracts in `src/lib/schemas/receipts.ts` (upload payload, parsed output, draft update). Infer types for server/client use.
- Add Prisma models or fields (if missing) before building UI. Keep schema changes in sync with `@docs/db-schema.sql`.
- Create receipt service helpers in `src/lib/services/receipts.ts` for upload, parse status polling, metadata updates, activation, and deletion.
- Expose server actions through `src/stack/server.tsx` using narrow named exports (e.g., `uploadReceipt`, `confirmReceipt`). Guard with Clerk auth checks and Zod validation.
- Co-locate React Query hooks in `src/stack/client.tsx` (e.g., `useReceipt`, `useReceiptLineItems`). Hooks should hide mutation wiring and optimistic cache updates.
- Store feature-specific Zustand state (wizard steps, UI flags) inside `src/app/(receipts)/_stores/receipt-wizard-store.ts`.

## `UploadReceiptModal`
1. Create component at `src/app/(receipts)/_components/upload-receipt-modal.tsx` using shadcn `Dialog` primitives.
2. Build form with React Hook Form + Zod schema (file input, group selector, optional notes). Enforce ≤150 LOC per component by extracting reusable bits.
3. On submit, call `uploadReceipt` server action. Optimistically close modal and trigger toast via `useToast`.
4. Use `useMutation` from TanStack Query to handle submission and invalidation of receipt list queries. Apply optimistic placeholder card while processing.
5. Handle file upload to S3 via presigned URL (generate in server action). Keep UI responsive with `UploadProgress` sub-component.
6. Tests: Write component test ensuring validation errors, happy path success, and error toast states. Use testing pattern defined in workflows (React Testing Library + user-event).

## `ReceiptProcessingToast`
1. Register global toast listener inside `src/app/providers/toast-provider.tsx` (if missing) to display processing status.
2. Build toast component that polls `useReceiptProcessingStatus` hook every few seconds (respect reduced motion and unmount cleanup).
3. Handle states: pending (spinner), failed (retry button calling `retryParsing` server action), completed (CTA to open draft).
4. Ensure accessibility: ARIA live region for status updates.

## `ReceiptDraftEditorPage`
1. Route file: `src/app/receipts/[receiptId]/draft/page.tsx`. Use server component for data fetching, client component for interaction.
2. Server loader uses `getReceiptDraft` service and passes typed props into client `ReceiptDraftEditor`.
3. Client editor composes `ReceiptHeaderCard`, `ReceiptLineItemsTable`, and `ReceiptTotalsSidebar`.
4. Implement autosave pattern: debounce updates (React Hook Form + Zustand) and send to `updateReceiptDraft` server action.
5. Provide diff-aware undo stack (optional stretch) storing previous values.
6. Gate transitions: only allow `Confirm` when totals balanced and all line items categorized.

## `ReceiptHeaderCard`
1. Presentational component under `_components`. Displays merchant, date, currency, and payer.
2. Use shadcn `Card` elements. Provide `Select` for payer that writes to Zustand store (avoiding prop drilling).
3. Fire `updateReceiptDraft` mutation on change with optimistic UI and rollback on error.
4. Show status badge (processing/draft/active) using shared `StatusBadge` component.

## `ReceiptLineItemsTable`
1. Create feature table with virtualization (use `@tanstack/react-table` + `react-virtual`).
2. Row editing flows: inline inputs bound to form controller; support keyboard shortcuts defined in user stories (e.g., `Shift+Enter` to confirm).
3. Integrate `CategoryQuickAssignMenu` and participant assignment gizmos. Use composition to keep file under 150 LOC.
4. Handle add/remove: call `createLineItem` / `deleteLineItem` mutations with optimistic updates and audit logging.
5. Display validation errors inline with accessible `aria-describedby`.

## `ReceiptTotalsSidebar`
1. Sidebar component that recalculates totals via `useMemo`, showing subtotal, tax, tip, and grand total.
2. Compare against receipt total; if mismatch, surface inline error banner preventing activation.
3. Provide action buttons (`Confirm`, `Discard`). Confirm triggers `activateReceipt` server action; on success, redirect to receipt detail page.
4. Include summary of participant balances for this receipt (pull from `useReceiptShares`).

## `ReceiptActionsBar`
1. Sticky footer with `Confirm`, `Delete`, and `View Audit Log` buttons.
2. `Delete` opens `SoftDeleteDialog` requiring confirmation; server action marks receipt deleted and invalidates caches.
3. `View Audit Log` opens `ActivityLogTimeline` filtered by receipt ID.
4. Ensure keyboard shortcuts (e.g., `Cmd+S` to confirm) use `useHotkeys` hook with cleanup.

## `ReceiptsOverviewPage` & `ReceiptCard`
1. Implement list route `src/app/receipts/page.tsx` with filters (month, status, payer) stored in URL search params.
2. Use TanStack Query to fetch receipt summary list; suspense-friendly server component wrapper for SEO.
3. `ReceiptCard` shows status, payer avatar, total, outstanding balance. Provide quick actions: `Open`, `Resume Draft`, `Delete`.
4. Loading state uses skeleton cards; empty state encourages uploading first receipt.

## Testing & Verification
- Snapshot key UI states with Storybook or Chromatic (optional but recommended).
- Integration tests: Ensure creation-to-activation happy path plus edge cases (AI failure, deletion).
- Run `npm test` and `npm run lint` per workflow.
- Update documentation in this folder when components evolve. Keep cross-links to `business-logic.md` for rules enforcement.
