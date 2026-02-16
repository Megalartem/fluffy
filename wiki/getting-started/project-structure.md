# Project Structure

Understanding the organization of the Fluffy codebase.

## Overview

Fluffy follows a **feature-based architecture** with clear separation between:
- **Application layer** (Next.js routes)
- **Feature modules** (domain features)
- **Core services** (business logic)
- **Shared utilities** (cross-cutting concerns)

## Directory Structure

```text
fluffy/
├── src/                          # Application source code
│   ├── app/                      # Next.js App Router (routes & pages)
│   ├── core/                     # Core business logic
│   ├── features/                 # Feature modules
│   ├── shared/                   # Shared utilities & components
│   └── lib/                      # Third-party integrations
│
├── docs/                         # Technical documentation
├── wiki/                         # Developer wiki
├── wiki/                         # 📚 All documentation
│   ├── getting-started/          # Installation, quick start
│   ├── product/                  # Product specifications
│   ├── design/                   # Design system
│   ├── development/              # Technical docs
│   ├── guides/                   # How-to guides
│   ├── planning/                 # Roadmap, status
│   ├── decisions/                # ADRs
│   └── archive/                  # Historical docs
│
├── public/                       # Static assets
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
└── eslint.config.mjs             # ESLint configuration
```

## Source Code (`src/`)

### `app/` - Next.js App Router

Contains all routes, layouts, and pages using Next.js App Router conventions.

```text
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Home page (/)
├── globals.css                   # Global styles
├── (app)/                        # App routes group
│   ├── transactions/             # /transactions
│   ├── goals/                    # /goals
│   ├── categories/               # /categories
│   └── settings/                 # /settings
└── test/                         # Test pages
```

> **Key concept**: Routes are defined by folder structure. Each folder can have `page.tsx`, `layout.tsx`, `loading.tsx`, etc.

### `core/` - Core Business Logic

Contains the heart of the application: domain models, repositories, services, and sync logic.

```text
core/
├── db/                           # Database (Dexie/IndexedDB)
│   └── dexie-schema.ts           # Database schema definition
│
├── domain/                       # Domain models & services
│   ├── transaction/              # Transaction domain
│   ├── category/                 # Category domain
│   ├── goal/                     # Goal domain
│   └── workspace/                # Workspace domain
│
├── repositories/                 # Data access layer
│   ├── transaction-repository.ts
│   ├── category-repository.ts
│   └── goal-repository.ts
│
├── services/                     # Business logic services
│   ├── transaction-service.ts
│   ├── category-service.ts
│   └── goal-service.ts
│
├── sync/                         # Synchronization engine
│   ├── sync-engine.ts            # Main sync orchestrator
│   ├── conflict-resolver.ts      # Conflict resolution
│   └── sync-adapter.ts           # Sync protocol adapter
│
├── offline/                      # Offline-first patterns
│   └── queue/                    # Operation queue
│
└── cloud/                        # Cloud integration
    └── cloud-adapter.ts          # Cloud API adapter
```

> **Key concept**: Core is framework-agnostic and contains pure business logic.

### `features/` - Feature Modules

Each feature is a self-contained module with its own components, hooks, and logic.

```text
features/
├── transactions/                 # Transaction management
│   ├── components/               # Transaction UI components
│   ├── hooks/                    # Transaction-specific hooks
│   └── types.ts                  # Feature types
│
├── categories/                   # Category management
│   ├── components/
│   ├── hooks/
│   └── types.ts
│
├── goals/                        # Goal management
│   ├── components/
│   ├── hooks/
│   └── types.ts
│
└── settings/                     # Application settings
    ├── components/
    └── hooks/
```

> **Key concept**: Features can depend on `core/` and `shared/`, but not on each other.

### `shared/` - Shared Utilities

Cross-cutting concerns used across multiple features.

```text
shared/
├── ui/                           # Reusable UI components
│   ├── button/
│   ├── input/
│   ├── modal/
│   └── ...
│
├── hooks/                        # Shared React hooks
│   ├── use-local-storage.ts
│   ├── use-debounce.ts
│   └── ...
│
├── lib/                          # Utility functions
│   ├── date-utils.ts
│   ├── currency-utils.ts
│   └── ...
│
├── config/                       # App configuration
│   └── app-config.ts
│
├── constants/                    # Constants
│   └── app-constants.ts
│
├── di/                           # Dependency injection
│   └── domain-services.ts        # Service composition root
│
├── errors/                       # Error handling
│   └── app-errors.ts
│
├── logging/                      # Logging utilities
│   └── logger.ts
│
├── providers/                    # React Context providers
│   ├── workspace-provider.tsx
│   └── theme-provider.tsx
│
├── state/                        # Global state management
│   └── store.ts
│
└── validation/                   # Validation schemas
    └── schemas.ts
```

> **Key concept**: Everything in `shared/` should be reusable and generic.

### `lib/` - Third-party Integrations

Wrappers and utilities for external libraries.

```text
lib/
├── utils.ts                      # General utilities (clsx, etc.)
└── storage/                      # Storage abstractions
```

## Key Concepts

### 1. Workspace

The **workspace** is the fundamental unit of organization in Fluffy:
- Each workspace has its own transactions, categories, goals
- Users can have multiple workspaces (e.g., personal, business)
- Workspaces sync independently

**Implementation**: `src/core/workspace/`

### 2. Offline-First

Fluffy works completely offline by default:
- All data stored locally in IndexedDB (via Dexie)
- Background sync when online
- Optimistic updates for instant UI response
- Conflict resolution for concurrent edits

**Implementation**: `src/core/offline/`, `src/core/sync/`

### 3. Domain-Driven Design (DDD)

The codebase follows DDD principles:
- **Entities**: Transaction, Category, Goal (with IDs)
- **Value Objects**: Money, DateRange, TransactionType
- **Repositories**: Data access abstraction
- **Services**: Business logic orchestration

**Key files**:
- Domain models: `src/core/domain/*/model.ts`
- Repositories: `src/core/repositories/*-repository.ts`
- Services: `src/core/services/*-service.ts`

### 4. Dependency Injection

Services are wired together in the composition root:

**File**: [src/shared/di/domain-services.ts](../../src/shared/di/domain-services.ts)

This allows:
- Testability (mock dependencies)
- Loose coupling
- Clear dependency graph

### 5. Feature Isolation

Each feature is independent:
- Self-contained components
- Own hooks and types
- Can be developed in parallel
- Easy to understand and test

## Where to Find Things

### Adding a New Transaction
- **UI**: `src/features/transactions/components/`
- **Logic**: `src/core/services/transaction-service.ts`
- **Storage**: `src/core/repositories/transaction-repository.ts`
- **Route**: `src/app/(app)/transactions/page.tsx`

### Modifying the Database Schema
- **Schema**: `src/core/db/dexie-schema.ts`
- **Migrations**: Add version in schema file

### Creating a UI Component
- **Shared**: `src/shared/ui/` (if reusable)
- **Feature**: `src/features/[feature]/components/` (if feature-specific)

### Adding a New Page/Route
- **Create**: `src/app/(app)/[route]/page.tsx`
- **Layout**: `src/app/(app)/layout.tsx` (if custom layout needed)

### Working on Sync Logic
- **Engine**: `src/core/sync/sync-engine.ts`
- **Adapter**: `src/core/cloud/cloud-adapter.ts`
- **Conflicts**: `src/core/sync/conflict-resolver.ts`

## Architecture Decisions

Important architectural decisions are documented in ADRs (Architecture Decision Records):

- [ADR Index](../decisions/README.md)
- [ADR-0001: Goals, Contributions, Transactions](../decisions/0001-goals-contributions-transactions.md)
- [ADR-0002: Category Deletion Semantics](../decisions/0002-categories-deletion-semantics.md)

## File Naming Conventions

- **Components**: PascalCase files, e.g., `TransactionList.tsx`
- **Hooks**: camelCase with `use-` prefix, e.g., `use-transactions.ts`
- **Services**: kebab-case with `-service` suffix, e.g., `transaction-service.ts`
- **Types**: kebab-case with `.ts` extension, e.g., `transaction-types.ts`
- **Utils**: kebab-case, e.g., `date-utils.ts`

## Import Paths

The project uses TypeScript path aliases:

```typescript
// Instead of: ../../../shared/ui/button
import { Button } from '@/shared/ui/button';

// Instead of: ../../core/services/transaction-service
import { TransactionService } from '@/core/services/transaction-service';
```

Configuration: [tsconfig.json](../../tsconfig.json)

## Next Steps

- **Read the architecture**: [Architecture Guide](../development/architecture.md)
- **Understand patterns**: [Offline-First Patterns](../development/offline-first.md)
- **Start contributing**: [First Contribution](./first-contribution.md)

## Questions?

- Check [Development Guides](../development/README.md)
- Review [Product Documentation](../product/README.md)
- See [Design System](../design/README.md)
