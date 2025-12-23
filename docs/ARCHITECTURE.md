# Fluffy Architecture

## Overview

Fluffy is a modern, offline-first personal finance manager built with Next.js 15, TypeScript, and IndexedDB. The architecture emphasizes clean separation of concerns, offline-first capabilities, and cloud synchronization readiness.

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components (UI)                    │
│  - Pages, Layouts, Sheets, Modals, Forms                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Feature Modules (Features Layer)                │
│  - transactions  - budgets    - categories                  │
│  - goals         - dashboard  - settings                    │
│  - sync          - backup     - notifications               │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                 Core Business Logic (Core)                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Sync      │  │  Offline     │  │   Cloud      │      │
│  │   Engine    │  │  Strategy    │  │   Provider   │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Repository Interfaces                   │   │
│  │  ITransactionsRepo, IBudgetsRepo, IGoalsRepo...    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Data Access Layer (Repos/DB)                    │
│                                                              │
│  ┌──────────────┐         ┌─────────────────┐              │
│  │   Dexie.js   │────────▶│  IndexedDB      │              │
│  │  (Local DB)  │         │  (Browser)      │              │
│  └──────────────┘         └─────────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. UI Layer (`src/app`, `src/ui`, `src/shared/ui`)

**Responsibilities:**
- Render user interface components
- Handle user interactions
- Display data from features/hooks
- Client-side routing (Next.js App Router)

**Key Technologies:**
- React 19 (Server & Client Components)
- Next.js 15 (App Router, Turbopack)
- Tailwind CSS + shadcn/ui
- Lucide React (icons)

**Patterns:**
- Component composition
- Controlled forms
- Client/Server component separation
- Sheet/Modal patterns for overlays

### 2. Features Layer (`src/features`)

**Responsibilities:**
- Feature-specific business logic
- Custom hooks for data fetching/mutations
- API layer for services
- UI components specific to features

**Structure per Feature:**
```
features/
  transactions/
    ├── api/         # Service layer, facades
    ├── hooks/       # React hooks (use-transactions.ts)
    ├── model/       # Types, schemas, validators
    └── ui/          # Feature-specific components
```

**Key Patterns:**
- Feature Slices (FSD-inspired)
- React hooks for state/side effects
- Service facades for business logic

### 3. Core Layer (`src/core`)

**Responsibilities:**
- Domain logic independent of UI
- Sync engine and conflict resolution
- Cloud provider abstractions
- Repository interfaces

**Modules:**

#### Sync Engine (`src/core/sync`)
- **SyncEngine**: Orchestrates push/pull/conflict resolution
- **ChangeTracker**: Tracks local changes for sync
- **ConflictResolver**: Resolves sync conflicts (strategies: local, remote, merge, last-write-wins)
- **OperationQueue**: Queues operations for offline mode
- **SyncAdapter**: Abstraction for cloud providers

#### Cloud Provider (`src/core/cloud`)
- **ICloudProvider**: Interface for cloud backends
- **FirebaseSyncAdapter**: Firebase implementation
- **CloudConfigManager**: Configuration management
- **CloudAuth**: Authentication abstraction

#### Offline Strategy (`src/core/offline`)
- **OfflineDetector**: Network status detection
- **RetryStrategy**: Exponential backoff for retries
- **useSyncStatus**: React hook for sync state

#### Repositories (`src/core/repos`, `src/core/repositories`)
- Abstract repository interfaces
- Dexie implementations
- In-memory implementations (for testing)

### 4. Data Layer (`src/core/db`)

**Responsibilities:**
- Database schema and migrations
- IndexedDB access via Dexie.js
- Storage management and cleanup

**Key Components:**
- **FluffyDatabase**: Dexie schema (v6 with sync fields)
- **StorageManager**: Quota management, cleanup
- Compound indices for performance

**Schema v6 (Cloud-Sync Ready):**
```typescript
interface Entity {
  id: string;
  workspaceId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  version: number;
  lastSyncedAt?: number;
  syncStatus?: "pending" | "synced" | "conflict" | "error";
}
```

### 5. Shared Layer (`src/shared`)

**Responsibilities:**
- Cross-cutting concerns
- Reusable utilities
- Constants and configurations
- Dependency injection (DI)

**Modules:**
- `config/`: WorkspaceContext, app configuration
- `constants/`: System constants, limits
- `di/`: Dependency injection container
- `errors/`: Error types (AppError)
- `lib/`: Utilities, helpers
- `logging/`: Logger implementation
- `state/`: Global state management
- `ui/`: Reusable UI components
- `validation/`: Validation schemas

## Data Flow

### Read Flow (Display Transactions)
```
UI Component
  └─▶ useTransactions() hook
       └─▶ TransactionsService
            └─▶ DexieTransactionsRepo
                 └─▶ Dexie (IndexedDB)
                      └─▶ Data returned back up the chain
```

### Write Flow (Create Transaction)
```
UI Form Submit
  └─▶ onSubmit handler
       └─▶ TransactionsService.create()
            ├─▶ DexieTransactionsRepo.create()
            │    └─▶ Dexie.transactions.add()
            └─▶ SyncEngine.trackChange()
                 └─▶ ChangeTracker.track()
```

### Sync Flow (Push/Pull)
```
SyncEngine.sync()
  ├─▶ Push Phase:
  │    └─▶ SyncAdapter.push(changes)
  │         └─▶ Firebase Firestore batch write
  │
  └─▶ Pull Phase:
       ├─▶ SyncAdapter.pullSince(lastSyncTime)
       │    └─▶ Firebase query with timestamp filter
       │
       └─▶ ConflictResolver.detectConflicts()
            └─▶ ConflictResolver.resolve(strategy)
```

### Offline Flow (No Network)
```
User Action (offline)
  └─▶ TransactionsService.create()
       ├─▶ DexieTransactionsRepo.create() ✅ Succeeds locally
       └─▶ SyncEngine.trackChange()
            └─▶ OperationQueue.enqueue()
                 └─▶ Queued for later sync

[Network comes back online]
  └─▶ SyncEngine.handleOnline()
       └─▶ SyncEngine.drainQueue()
            └─▶ Process all queued operations
```

## Key Design Patterns

### 1. Repository Pattern
- Abstract data access behind interfaces
- Swap implementations (Dexie ↔ In-Memory ↔ Firebase)
- Easy testing with mock repositories

### 2. Adapter Pattern
- `SyncAdapter` abstracts cloud providers
- `FirebaseSyncAdapter`, `SupabaseSyncAdapter` (future)
- Provider-agnostic sync engine

### 3. Strategy Pattern
- `ConflictStrategy`: local, remote, merge, last-write-wins
- Configurable conflict resolution
- Pluggable retry strategies

### 4. Observer Pattern
- `SyncAdapter` events: connected, disconnected, synced, error, status
- UI components listen to sync state changes
- Decoupled event-driven architecture

### 5. Offline-First Pattern
- Local database is source of truth
- All operations work offline
- Background sync when online
- Conflict resolution on sync

### 6. Feature-Sliced Design (Inspired)
- Features are self-contained modules
- Clear boundaries between layers
- Dependency rules: UI → Features → Core → Data

## State Management Strategy

### Local State
- React `useState` for component-local state
- Form state managed by controlled components

### Server State (Data Fetching)
- Custom hooks (`useTransactions`, `useBudgets`)
- Dexie live queries for reactivity
- No external state library needed

### Global State
- `WorkspaceContext` for current workspace
- `useSyncStatus` for sync state
- Minimal global state, prefer component props

### Sync State
- Managed by `SyncEngine`
- Exposed via `useSyncStatus` hook
- Reactive updates via events

## Performance Optimizations

### Database
- Compound indices for common queries:
  - `[workspaceId+date]` for transaction lists
  - `[workspaceId+categoryId]` for budget lookups
- Soft delete pattern (deletedAt field)
- Periodic cleanup of old soft-deleted records

### Rendering
- React Server Components for static content
- Client components only where needed
- Lazy loading of heavy components

### Sync
- Delta sync: only pull changes since last sync
- Batch operations to reduce roundtrips
- Debounced sync triggers

### Storage
- Storage quota monitoring
- Automatic cleanup strategies
- Compression for large datasets (future)

## Error Handling

### Error Types
```typescript
class AppError extends Error {
  code: string;
  context?: Record<string, any>;
}
```

### Error Boundaries
- Top-level error boundary in app-shell
- Feature-level boundaries for isolated failures
- Fallback UI for graceful degradation

### Sync Errors
- Retryable vs non-retryable errors
- Exponential backoff for retries
- User-facing error messages

## Security Considerations

### Data Storage
- IndexedDB data is local to browser
- No sensitive data in localStorage
- Encryption for cloud sync (future)

### Authentication
- Firebase Auth integration (ready)
- Token refresh handling
- Workspace-level access control

### Validation
- Input validation on client
- Schema validation with Zod (future)
- Server-side validation when syncing

## Testing Strategy

### Unit Tests
- Core logic (SyncEngine, ConflictResolver)
- Repository implementations
- Utility functions

### Integration Tests
- Feature workflows (create transaction → sync)
- Database operations
- Offline/online transitions

### E2E Tests
- Critical user flows
- Sync scenarios
- Conflict resolution

## Deployment Architecture

### Development
- Next.js dev server with Turbopack
- Hot module replacement
- Local IndexedDB

### Production
- Static export (Next.js SSG)
- Deployed to Vercel/Netlify/Cloudflare Pages
- CDN edge distribution
- Optional: Serverless functions for API

### Data Storage
- **Local**: IndexedDB (primary)
- **Cloud**: Firebase Firestore (optional)
- **Backup**: Cloud Storage (optional)

## Scalability Considerations

### Client-Side
- IndexedDB supports millions of records
- Virtual scrolling for large lists
- Lazy loading and pagination

### Cloud-Side
- Firestore scales automatically
- Workspace-level data partitioning
- Eventual consistency model

### Sync
- Incremental sync reduces bandwidth
- Conflict-free replicated data types (future)
- Multi-device sync support

## Future Enhancements

### Short-term
- Real Firebase integration (replace TODOs)
- Unit tests for sync engine
- PWA capabilities

### Medium-term
- Supabase provider implementation
- End-to-end encryption
- Collaborative workspaces

### Long-term
- Native mobile apps (React Native)
- Advanced analytics
- AI-powered insights

## References

- [Dexie.js Documentation](https://dexie.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Offline-First Architecture](https://offlinefirst.org/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated**: December 2025  
**Version**: Phase 4 Complete
