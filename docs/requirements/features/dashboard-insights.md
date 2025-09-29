# Dashboard Insights Implementation Guide

Deliver the analytics experience described in `features.md` by following this step-by-step plan. Align with architectural guidance in `docs/architecture.md` and coding standards.

## Data Foundations
- Define analytics schemas in `src/lib/schemas/dashboard.ts` (filters, KPI payloads, chart datasets).
- Implement aggregation services in `src/lib/services/dashboard.ts`: `getMonthlyExpenses`, `getParticipantBalances`, `getCategoryBreakdown`, `getReceivables`.
- Use Prisma aggregate queries with proper indexes. Consider caching results in Redis (future) but start with direct DB access.
- Expose server actions in `src/stack/server.tsx`: `fetchDashboardSummary`, `fetchParticipantBalances`, etc. Validate tenancy and permissions.
- Create React Query hooks in `src/stack/client.tsx` with memoized selectors: `useDashboardSummary(filters)`, `useReceivables(filters)`.

## `DashboardPage`
1. Route: `src/app/dashboard/page.tsx`. Server component reads search params for filters and fetches initial summary via server action.
2. Hydrate client `DashboardShell` with data; use suspense for secondary panels to avoid blocking first paint.
3. Layout with CSS grid: overview metrics, charts, receivables list. Ensure responsiveness (mobile stacked, desktop 12-column grid).
4. Provide skeleton placeholders while data loads.

## `DashboardFilterBar`
1. Component with shadcn `Popover` + `Command` for quick filter selection (time range, participant, group, category).
2. Manage state with `useDashboardFilters` hook (Zustand) syncing to URL search params using `useTransition`.
3. When filters change, call `setFilters`, which triggers React Query refetch (thanks to query key including filter hash).
4. Include `Reset` button clearing store and URL.

## `NetBalanceWidget`
1. Component showing net owed per participant. Use card layout with avatar, amount, status badge (owed/owing/settled).
2. Accepts `data: ParticipantBalance[]` typed from schema.
3. Sort participants descending by absolute balance. Use color coding (Tailwind classes) consistent with design tokens.
4. Provide tooltip explaining calculation (sum of shares minus payments) referencing business logic.

## `ReceivablesList`
1. Shows outstanding amounts others owe the current user.
2. Use accessible list with clickable rows linking to receipts.
3. Each row includes participant name, outstanding amount, due date (if available), and CTA to `RecordPaymentModal` prefilled.
4. Support infinite scroll if list long; otherwise, use pagination controls reusing TanStack Query `useInfiniteQuery`.

## `BreakdownTabs`
1. Tabs component toggling between `By Month`, `By Participant`, `By Receipt`, `By Category`.
2. Each tab lazy-loads a chart component via `next/dynamic` to keep bundle small.
3. Charts: adopt `@tanstack/react-charts` or `recharts` (if already in project). Wrap with `ChartCard` shared component ensuring consistent styling.
4. Provide export button (CSV) per tab calling server action to stream data.

## Performance & Accessibility
- Memoize chart datasets using `useMemo` to prevent unnecessary re-renders.
- Use `aria-live` for summary updates so screen readers announce new totals.
- Respect reduced motion by disabling chart animations when `prefers-reduced-motion` true.
- Keep components under 150 LOC; extract subcomponents for cards, charts, legends.

## Testing Checklist
- Write integration tests for filters to ensure React Query refetches correctly and UI updates.
- Snapshot tests for chart components with mock data.
- Unit tests for aggregation services ensuring calculations follow business logic (e.g., totals equal line item sums minus payments).
- Manual QA: verify mobile layout, keyboard navigation for filter bar, and correct timezone handling for monthly grouping.
