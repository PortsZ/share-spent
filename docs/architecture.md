# Architecture

This is a finance/accounting app for business owners and accountants.

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5+ (App Router)
- **Language**: TypeScript
- **UI Library**: [Shadcn/ui]
- **Styling**: [Tailwind CSS]
- **State Management**: [Zustand]
- **Data Fetching**: [Tanstack Query]
- **Form management**: [React Hook Form]
- **Animations**: [Motion (previously framer motion)]

### Backend

- **Runtime**: Node.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Clerk
- **API**: Next.js API Routes

### Infrastructure

- **Hosting**: Vercel
- **Database**: Neon (PostgreSQL)
- **File Storage**: AWS S3
- **Monitoring**: Sentry

## 📁 Project Structure

- Clear separation of frontend and backend code
- Clear separation of app's features and modules into distinct directories

## 🎯 System Design Principles

- The system is expected to vastly expend in functionality
- Modularity and scalability is key. The system will start small and will accumulate funtionality over time
- Multitude of third party integrations are expected to be implemented in the future (e.g. various banks, government and other APIs)
- The system is dealing with corporate finances and accounting and thus expected to have incredibly robust consistency and reliability of data

## 🗄️ Database

### Schema Structure

- Source: `@docs/db-schema.sql`
- Reference: `@docs/p/data-model.md`

## 🔄 Data Flow Architecture

### Client-Server Communication

- **API Layer**: Next.js API routes for server actions
- **Data Fetching**: [TBD - React Query, SWR, native fetch]

### Database Access Pattern

- **ORM**: Prisma for type-safe database operations
- **Connection**: Connection pooling via Neon
- **Migrations**: Prisma for schema changes
- **Seeding**: Next seed scripts for development data

## 🔐 Security Architecture

### Authentication & Authorization

- **Auth Provider**: Clerk Auth for user management
- **Session Management**: Clerk Auth sessions with Next.js middleware
- **Multi-tenancy**: Organization-based access control
- **API Security**: Protected routes with auth verification

### Data Security

- **Input Validation**: Zod
- **SQL Injection**: Prevented by Prisma ORM
- **Environment Variables**: Secure config management
- **HTTPS**: Enforced in production

## 🏢 Multi-tenancy

- Organization-based tenancy with Clerk integration for authentication
- Data isolation at the organization level
- Multi-tenancy ensurance using Postgres RLS
- Plan-based feature access through Organization-Plan relationship
- Role-based permissions within organizations

## ⚡ Performance Considerations

### Frontend Optimization

- **Code Splitting**:
  - Automatic route-based splitting via Next.js App Router
  - Dynamic imports for heavy components using `next/dynamic`
  - Third-party library splitting for optimal caching
  - Lazy loading of non-critical UI components with Skeleton from shadcn

- **State Management & Caching**:
  - Zustand stores with localStorage persistence for client-side state
  - Selective re-rendering using Zustand selectors to prevent unnecessary updates
  - Optimistic updates for better perceived performance
  - Strategic cache invalidation based on user actions

- **Asset Optimization**:
  - Next.js Image component with automatic WebP conversion
  - SVG optimization for icons and illustrations
  - Font optimization with `next/font` for better loading performance
  - Static asset compression and CDN delivery via Vercel

- **Bundle Optimization**:
  - Bundle analysis using `@next/bundle-analyzer` for monitoring
  - Tree shaking to eliminate unused code
  - Dynamic imports for heavy third-party libraries (charts, PDFs, etc.)
  - Vendor chunk splitting for better caching strategies

- **Runtime Performance**:
  - React concurrent features for better user experience
  - Memoization of expensive calculations using `useMemo` and `useCallback`
  - Virtual scrolling for large data sets (financial transactions)
  - Debounced search and form inputs to reduce API calls

- **Loading Strategies**:
  - Skeleton loading states for better perceived performance
  - Nextjs dedicated loading.tsx
  - Progressive enhancement for critical financial data
  - Prefetching of likely-needed routes and data
  - Streaming server components for faster initial page loads

### Backend Optimization

- **Database**: Proper indexing on frequently queried fields
- **API**: Response caching where appropriate
- **Connection Pooling**: Database connection optimization

## 🔧 Development Workflow

### Code Quality

- **Linting**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode
- **Testing**: [TBD - Jest, Vitest, Playwright]
- **Pre-commit**: Husky hooks for quality gates

### CI/CD Pipeline

- **Version Control**: Git with feature branch workflow
- **Deployment**: Automatic deployments via Vercel
- **Database**: Migration checks in CI
- **Testing**: Automated test suite execution