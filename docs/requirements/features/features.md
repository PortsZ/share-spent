# Features Playbook

This playbook outlines the high-level surface area of the ShareSpent app. Each section maps directly to the user stories and clarifies the UI components, primary flows, and system collaborations required to deliver them.

## Receipt Management

### Upload & Parse Receipt
- `UploadReceiptModal` (triggered from dashboard and receipts list) handles image upload and basic validation.
- `ReceiptProcessingToast` surfaces OCR progress and errors while AI extraction runs asynchronously.
- `ReceiptDraftEditorPage` displays parsed metadata and line items for manual review once processing finishes.

### Receipt Detail & Actions
- `ReceiptHeaderCard` shows merchant, date, total, currency, and payer selector.
- `ReceiptLineItemsTable` lists line items with inline editing, category pickers, and participant assignment controls.
- `ReceiptTotalsSidebar` tracks running totals, taxes, and tips, ensuring validation before activation.
- `ReceiptActionsBar` provides confirm activation, delete (soft delete), and audit log access.

### Receipt Listing
- `ReceiptsOverviewPage` aggregates all group receipts with filters by month, status, and payer.
- `ReceiptCard` previews status (`processing`, `draft`, `active`, `deleted`) and quick actions like reopen draft or view details.

## Line Item Matching

### Pending Review Queue
- `PendingLineItemsPanel` highlights items awaiting confirmation across receipts.
- `LineItemCard` exposes description, price, category, and participant chips with shortcut-triggered actions.

### Matching Workspace
- `LineItemMatcherPage` presents a side-by-side layout: receipt snapshot, AI suggestions, participant list.
- `QuickAssignToolbar` offers shortcut buttons (assign to self, split evenly, copy last mapping).
- `ManualLineItemForm` lets users add or modify line items during draft or active states with audit tracking.

## Payment & Reconciliation

### Pending Payments
- `PendingPaymentsPage` lists unsettled payments grouped by counterparty.
- `PaymentRow` shows amount, related receipt/line items, created date, and accept/decline controls.

### Payment History
- `PaymentHistoryPage` surfaces confirmed payments the user has made or received.
- `PaymentFiltersBar` limits view by timeframe, group, or participant.

### Record Payment
- `RecordPaymentModal` captures payer, payee, amount, date, and target receipt/line items.
- `PaymentConfirmationBanner` updates participant balances and acknowledges shared settlements.

## Dashboard Insights

### Overview Metrics
- `DashboardPage` renders monthly spend charts, participant balances, and category summaries.
- `NetBalanceWidget` highlights how much each participant owes or is owed.
- `ReceivablesList` enumerates outstanding amounts others owe the current user.

### Filters & Drilldowns
- `DashboardFilterBar` enables filtering by time range, participant, group, or category.
- `BreakdownTabs` toggle between month, participant, receipt, and category views.

## Categories Management

### Category CRUD
- `CategoriesPage` lists categories scoped to the active group with create/edit/delete actions.
- `CategoryFormDrawer` handles unique naming, color/icon metadata, and optional descriptions.
- `CategoryDependencyDialog` appears before deletion to reassign impacted line items or move them to `Uncategorized`.

### Quick Assign
- `CategoryQuickAssignMenu` is embedded in line item rows for inline selection or fast creation.

## Group Administration

### Group List & Invitations
- `GroupSwitcher` lists groups the user belongs to and surfaces pending invites.
- `InviteMembersModal` sends invitations and tracks acceptance status.
- `GroupRosterPanel` shows current members, roles, and revoke access controls.

### Group Settings
- `GroupSettingsPage` exposes metadata (name, avatar), deletion workflow, and export options.
- `DeleteGroupDialog` confirms destructive actions and communicates archival outcomes.

## Cross-Cutting Utilities

- `NotificationsCenter` surfaces AI parsing failures, pending approvals, and payment requests.
- `ActivityLogTimeline` records edits across receipts, line items, payments, and categories for audit needs.
- `GlobalSearchBar` (optional stretch) lets users jump to receipts, line items, or members quickly.

## Technical Considerations

- Pages correspond to Next.js route segments (e.g., `src/app/receipts/[receiptId]/page.tsx`). Shared components reside in `src/stack/client.tsx` modules for reuse.
- Server actions in `src/stack/server.tsx` handle data mutations (uploads, parsing, payments) with optimistic UI feedback from paired client hooks.
- Feature flags may guard advanced flows (e.g., manual line item editing on active receipts) to stage rollout safely.

