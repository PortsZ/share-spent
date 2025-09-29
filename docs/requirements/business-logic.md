# Business Logic

## Core Entities
- **User**: Member of one or more groups. Can upload receipts, manage line items, make payments, and manage categories.
- **Group**: Collaboration space (e.g., household). Owns receipts, categories, and membership list. Each user in the group has equal rights unless otherwise specified.
- **Receipt**: Expense record uploaded by a user on behalf of a group. Contains metadata (merchant, date, total, currency, payer) and a collection of line items.
- **Line Item**: Individual expense entry belonging to a receipt. Tracks description, quantity, unit price, category, assigned participants, and status flags for matching and settlement.
- **Category**: User-defined taxonomy scoped to a group. Used to classify line items.
- **Payment**: Evidence that a participant covered their share of one or more line items. Used for reconciliation.

## Group Lifecycle
- Creating a group instantiates an empty roster with the creator as the initial admin. Admins can invite or remove members and delete the group.
- Invited users must accept to join. Pending invitations prevent receipt assignment to that user until acceptance.
- Deleting a group archives all associated receipts, line items, categories, and payments. Restoration is not required for MVP.

## Receipt Flow
- A group member uploads a receipt image. The receipt enters `processing` status while AI runs OCR and translation to English.
- AI output produces structured line items (description, price, quantity, subtotal, taxes, tips) plus receipt metadata (merchant, date, total). Parsing errors are flagged for manual correction.
- Once parsing completes, the receipt becomes `draft`. Users can edit metadata, adjust totals, add/remove line items, and set the payer from existing group members.
- When the receipt is confirmed, it transitions to `active`. The payer is marked as having fronted the full total.
- Active receipts can be deleted (soft delete). Deleting a receipt cascades by marking its line items and pending settlements as cancelled. Historical payments tied to a deleted receipt remain for audit but are excluded from dashboards.

## Cost Sharing Rules
- The payer is the group member who covered the transaction and is automatically credited for the full receipt amount on activation.
- By default, each line item cost is split evenly among assigned participants. Participants include the payer unless explicitly removed.
- Line items support custom splits by assigning shares (percentage or fixed amounts) as long as the sum matches the item subtotal.
- Each participant’s open balance for a receipt equals the sum of their shares minus confirmed payments they have made toward those line items.
- Receipt totals must equal the sum of line item subtotals plus taxes and tips. Validation prevents activation until balanced.

## Line Item Management
- Pending line items (status `pending`) require user review. Users resolve them by:
  - Accepting AI suggestions.
  - Editing details manually.
  - Deleting irrelevant items.
- A matching screen allows users to map line items to group participants. Shortcut actions (keyboard or UI quick actions) accelerate assignments (e.g., assign to self, split equally, copy previous mapping).
- Users can manually add new line items or remove existing ones while the receipt is `draft` or `active` (with audit trail). Removing an item adjusts participant balances accordingly.
- Each line item must have a category before the receipt can be finalized. If no category exists, users can create one inline.

## Category Management
- Categories are scoped per group. Users can create, edit, archive, or delete categories.
- Each category has a unique name per group, optional description, and optional color/icon metadata.
- Deleting or archiving a category requires reassigning affected line items to another category or a default `Uncategorized` bucket.

## Payment & Reconciliation
- Users can record payments they have made to settle outstanding shares (e.g., cash, bank transfer).
- Payments reference specific receipts or line items, the payer, payee, amount, date, and status (`pending`, `confirmed`).
- Pending payments require acknowledgment by the counterpart. Once confirmed, the associated outstanding balances decrease.
- The system lists pending payments for action and historical payments for reference.
- A user can view receipts they have paid (as payer) and line items they have settled (as participant) for accountability.

## Dashboard & Summaries
- Dashboard aggregates data per group:
  - Expenses by month, participant, receipt, and category.
  - Net balances showing how much each participant owes or is owed.
  - Outstanding amounts a user should receive from others (`receivables`).
- Filters allow narrowing by time range, participant, or category. Deleted or archived receipts line items are excluded by default.

## Deletion & Audit Considerations
- Deleting receipts, line items, or categories should preserve historical audit logs for dispute resolution.
- Hard deletion is limited to group deletion; otherwise items are soft deleted with flags so dashboards can filter them out while keeping historical data accessible if needed.

## Error Handling & Notifications
- If AI parsing fails, users receive an alert and the receipt remains in `pending` status until manually resolved.
- Actions such as new receipts, pending approvals, or payment requests can trigger in-app notifications or emails (implementation detail) to keep participants informed.

