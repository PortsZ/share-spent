# Payment & Reconciliation Implementation Guide

Use this guide to deliver the payments feature set while aligning with `business-logic.md`, coding standards, and workflow docs.

## Foundations
- Extend `src/lib/schemas/payments.ts` with Zod schemas for payment creation, confirmation, rejection, and history filters. Infer types for reuse.
- Implement payment services in `src/lib/services/payments.ts`: `listPendingPayments`, `recordPayment`, `confirmPayment`, `rejectPayment`, `listPaymentHistory`.
- Add Prisma models/relations for payments if absent (payer, payee, amount, currency, lineItemIds[], receiptId, status, notes).
- Server actions exported from `src/stack/server.tsx`: ensure Clerk auth, group membership checks, and cross-verify balances before confirming.
- Create React Query hooks in `src/stack/client.tsx`: `usePendingPayments`, `usePaymentHistory`, `useRecordPayment`, `useConfirmPayment`. Cache keys include group ID for multi-tenancy.

## `PendingPaymentsPage`
1. Route: `src/app/payments/pending/page.tsx`. Server component fetches filter defaults; client component renders table.
2. Filters: counterparty, group, receipt, status. Persist filters in search params.
3. Use `DataTable` abstraction (shared) to display payments grouped by counterparty with expandable rows revealing related items.
4. Integrate bulk confirm/decline actions with optimistic updates (disable button until mutation resolves).
5. Handle empty state with CTA linking to `RecordPaymentModal`.

## `PaymentRow`
1. Row component shows amount (formatted via currency utility), related receipt/line items, creation date, and status pill.
2. Add confirm/decline buttons with confirmation dialogs. On confirm, call `confirmPayment` server action and update dashboards by invalidating relevant queries (`useDashboardSummary`).
3. Display audit link to `ActivityLogTimeline` filtered by payment ID.
4. Include tooltip for partial payments explaining outstanding balance.

## `PaymentHistoryPage`
1. Route: `src/app/payments/history/page.tsx`. Use infinite scroll or pagination via TanStack Query `useInfiniteQuery`.
2. Filters bar supports timeframe (quick ranges), group, participant. Persist in URL.
3. Render `PaymentHistoryList` component with sticky summary header showing totals paid/received.
4. Provide export button (CSV) calling server action to generate file in background (S3 link or streaming response).

## `PaymentFiltersBar`
1. Shared filter component using shadcn `Command` or `Select` controls.
2. Accepts `onChange` callback that updates router search params using `useTransition` for smooth updates.
3. Keep component under 150 LOC by extracting `FilterChip` subcomponents for active filters.

## `RecordPaymentModal`
1. Located under `src/app/payments/_components/record-payment-modal.tsx`.
2. Form fields: payer (default to current user), payee, amount, currency, date, receipt/line item picker, notes.
3. Use React Hook Form + Zod for validation: ensure amount > 0 and <= outstanding balance fetched from `useOutstandingBalances`.
4. On submit, call `recordPayment`. Optimistically add to pending list and close modal; show success toast.
5. Provide quick-fill chips (settle full balance, split evenly). Implement via helper functions in services layer.

## `PaymentConfirmationBanner`
1. Banner component displayed on receipt detail page when payment recorded. Shows remaining balance and CTA to view history.
2. Subscribe to TanStack Query cache updates for the relevant receipt to update in real time.
3. Accessible: role="status" with concise text. Provide dismiss action that persists preference via local storage (respect ♻️ comments when syncing state).

## Balance Synchronization
- After any payment mutation, update impacted aggregates: dashboard metrics, receipt balances, participant net balances. Do this through service helper `refreshFinancialSummaries` triggered server-side.
- Client should refetch `useDashboardSummary`, `useReceiptShares`, and `useReceivables` queries lazily (use `invalidateQueries`).
- Maintain audit entries for each mutation with before/after balances.

## Testing Strategy
- API tests for `recordPayment` and `confirmPayment` covering happy path, validation, insufficient balance, unauthorized user, race conditions.
- Component tests for modal (form validation, mutation success), pending list (bulk actions), and history filters.
- Consider contract tests for currency formatting and share calculations.
- Run `npm test` and `npm run lint` at completion per workflow.
