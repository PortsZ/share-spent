# Categories Management Implementation Guide

Build the categories feature using the steps below, keeping alignment with `business-logic.md`, coding rules, and workflows.

## Setup
- Add schemas in `src/lib/schemas/categories.ts`: category entity, create/update payloads, archive/delete commands.
- Service functions in `src/lib/services/categories.ts`: `listCategories`, `createCategory`, `updateCategory`, `archiveCategory`, `deleteCategory`, `reassignLineItems`.
- Ensure Prisma schema enforces uniqueness per group and includes optional color/icon fields.
- Server actions (exported from `src/stack/server.tsx`) should guard admin-only operations and orchestrate line item reassignment.
- Client hooks in `src/stack/client.tsx`: `useCategories`, `useCreateCategory`, `useUpdateCategory`. Provide selectors to minimize re-renders.

## `CategoriesPage`
1. Route: `src/app/categories/page.tsx`. Fetch categories via server component and hydrate client `CategoriesShell`.
2. Display list grouped by status (active, archived). Use shadcn `Tabs` or segmented control.
3. Provide search input and sort dropdown (name, usage count). Persist search in URL.
4. Show category usage count by joining line item data (service function should return counts).

## `CategoryFormDrawer`
1. Drawer triggered from `CategoriesPage` and inline quick assign.
2. Form fields: name, description, color (select), icon (select), status.
3. Validation: Zod ensures unique name (server-side check). Show inline error if duplicate.
4. Submit via respective mutation (create/update). Use optimistic update to insert or modify category list; rollback on error.
5. Respect ≤150 LOC by extracting `ColorPicker` and `IconPicker` subcomponents.

## `CategoryDependencyDialog`
1. Modal triggered before deletion/archiving if category in use.
2. Fetch affected line items count and sample list via `useCategoryDependencies` hook.
3. Provide reassignment UI: select new category or move to `Uncategorized`. Use `reassignLineItems` server action.
4. Only enable confirm when new category chosen (unless moving to default). Show progress indicator while mutation runs.

## `CategoryQuickAssignMenu`
1. Inline dropdown for assigning categories on line items.
2. Use shadcn `DropdownMenu` with search. Option to create category inline (opens `CategoryFormDrawer` in create mode).
3. Ensure keyboard support (typeahead) and ARIA roles.
4. On selection, call `assignCategoryToLineItem` server action. Provide optimistic UI update.

## Additional Considerations
- Maintain audit log entries for category create/update/delete actions.
- Implement soft delete (archive) by default; only allow hard delete when no dependencies.
- Expose analytics on category usage for dashboard (service returns counts per category).

## Testing
- Unit tests for service layer verifying uniqueness, reassignment edge cases, and audit logging.
- Component tests: drawer validation, dependency dialog flow, quick assign interactions.
- Manual QA: verify colors/icons accessible (contrast), keyboard navigation through menus, responsive layout.
