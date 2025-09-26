# Workflow: Implementing Frontend Components

This workflow follows TDD principles and ensures components are built with proper testing, accessibility, and performance from the start.

## 🎯 Pre-Implementation Planning

- **Write a plan** with todo items for yourself
- **Choose save strategy**: Determine if component needs autosave or manual save patterns
- **Identify location**: Global (`src/components/`) vs route-specific (`app/route/(assets)/_components` for components, `app/route/(assets)/_hooks` for hooks, etc.)
- **Define data flow**: Server Actions, Zustand stores, or local state

## 🏗️ Implementation Phase

### 3. Create Schemas (if needed)
- **Zod schemas** in appropriate location:
  - Global: `src/lib/schemas/`
  - Route-specific: `app/route/(assets)/_schemas/`
- **Infer TypeScript types** from schemas
- **Validation rules** for forms and data

### 4. Implement Server Actions (if needed)
- **Create Server Actions** following `@docs/frontend-code-rules.md` patterns
- **Validate inputs** with Zod schemas
- **Return data directly**, throw on errors
- **Add API routes** only if external access needed

### 5. Create Zustand Store (if needed)
- **Domain-focused stores** following established patterns
- **Selectors for components** to prevent unnecessary re-renders
- **Actions for mutations** with optimistic updates
- **Reset and hydrate** utilities

### 6. Build Component
- **Follow component rules** from `@docs/frontend-code-rules.md`:
  - ≤150 LOC per component
  - Single responsibility
  - Proper TypeScript types
  - shadcn/ui components
  - Accessibility features
- **Implement optimistic updates** for data mutations
- **Error boundaries** for graceful degradation
- **Loading states** with Skeleton components

### 7. Add Hooks (if needed)
- **Custom hooks** for component logic
- **Single responsibility** per hook
- **Consistent return patterns** using `{ doThing }` object
- **Proper cleanup** for timers and subscriptions

### 8. Style Component
- **Tailwind utilities** only
- **Responsive design** with mobile-first approach
- **Accessibility features**: ARIA labels, focus management
- **Motion preferences** respect for reduced motion
- **Financial data formatting** for currency/numbers

## ✅ Verification Phase

### 9. Check implementation
- **Check the rules** and re iterate if there are inconsistencies

### 10. Test User Experience
- **Manual testing** of component in browser
- **Keyboard navigation** works properly
- **Screen reader** compatibility
- **Mobile responsiveness** on different devices
- **Performance** with large data sets (if applicable)

### 11. Code Quality Checks
- Run `npm run lint` to ensure code quality

## 📚 Documentation Updates

### 12. Update Documentation
- **Add component** to relevant feature documentation `AI_IMPROVEMENTS.md/`
- **Update component library** if it's reusable
- **Document props interface** and usage examples
- **Add to Storybook** (if using) for design system

## 🔄 Component Types & Patterns

### UI Components (shadcn/ui)
```bash
# Location: src/components/ui/
# Generated only, don't modify
npx shadcn-ui@latest add button
```

### Shared Components
```bash
# Location: src/components/shared/
# Small, reusable presentational components
# Examples: UserAvatar, StatusBadge, CurrencyDisplay
```

### Feature Components
```bash
# Location: src/components/features/
# Feature-specific components used globally
# Examples: TransactionList, InvoiceForm, ReportChart
```

### Route-Specific Components
```bash
# Location: app/route/(assets)/_components/
# Components only used in specific routes
# Examples: DashboardSidebar, SettingsPanel
```

## 🔍 Quality Checklist

Before marking component complete, verify:

- [ ] Code is properly formatted (`npm run lint`)
- [ ] Component follows size limits (≤150 LOC)
- [ ] Proper TypeScript types throughout
- [ ] Accessibility requirements met
- [ ] Mobile responsive design
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Optimistic updates work correctly
- [ ] Performance is acceptable
- [ ] Documentation is updated

## 💡 Common Patterns

### Form Components
- Use React Hook Form + Zod validation
- Implement optimistic updates for autosave
- Show pending changes for manual save
- Handle server validation errors

### Data Display Components
- Use Skeleton loading states
- Implement virtual scrolling for large lists
- Format financial data consistently
- Handle empty states gracefully

### Interactive Components
- Provide immediate feedback
- Use optimistic updates appropriately
- Handle loading and error states
- Maintain accessibility standards

---

*Follow this workflow for every frontend component to ensure consistency, quality, and maintainability across the application.*