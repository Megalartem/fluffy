# Offline-First Patterns

## Philosophy

Offline-first is a design approach where applications are built to work offline as the default state, with connectivity treated as an enhancement. This guide covers patterns and best practices implemented in Fluffy.

## Core Principles

### 1. Local Database as Source of Truth
```
┌──────────────────┐
│   User Action    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Local Database  │ ◄── Primary data source
│   (IndexedDB)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Cloud Sync     │ ◄── Background process
│   (Optional)     │
└──────────────────┘
```

**Benefits**:
- Instant UI updates
- No loading spinners
- Works without network
- Resilient to connectivity issues

### 2. Eventual Consistency

Changes propagate eventually, not immediately:

```typescript
// User creates transaction
await db.transactions.add(transaction);  // ✅ Instant
// UI updates immediately

// Background: Sync engine detects change
syncEngine.trackChange('transaction', 'create', transaction);

// Later: When online, sync to cloud
await syncEngine.sync();  // Happens in background
```

### 3. Optimistic UI

Update UI immediately, sync in background:

```typescript
async function createTransaction(data) {
  // 1. Update UI optimistically
  const optimisticTx = { ...data, id: generateId(), status: 'pending' };
  setTransactions(prev => [...prev, optimisticTx]);

  try {
    // 2. Save to local DB
    const saved = await repo.create(data);
    
    // 3. Update UI with real data
    setTransactions(prev => 
      prev.map(tx => tx.id === optimisticTx.id ? saved : tx)
    );

    // 4. Track for sync (background)
    syncEngine.trackChange('transaction', 'create', saved);
  } catch (error) {
    // 5. Rollback on error
    setTransactions(prev => 
      prev.filter(tx => tx.id !== optimisticTx.id)
    );
    showError(error);
  }
}
```

## Implementation Patterns

### Pattern 1: Network Detection

Monitor network status and adapt behavior:

```typescript
// src/core/offline/detector.ts
export class OfflineDetector {
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    window.addEventListener('online', () => this.notify(true));
    window.addEventListener('offline', () => this.notify(false));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  subscribe(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(isOnline: boolean) {
    this.listeners.forEach(cb => cb(isOnline));
  }
}
```

**Usage**:
```typescript
const detector = new OfflineDetector();

detector.subscribe((isOnline) => {
  if (isOnline) {
    console.log('✅ Online - syncing...');
    syncEngine.sync();
  } else {
    console.log('📴 Offline - queueing operations');
  }
});
```

### Pattern 2: Operation Queue

Queue operations when offline, process when online:

```typescript
// src/core/sync/queue.ts
export class OperationQueue {
  private operations: Map<string, SyncOperation> = new Map();

  enqueue(operation: SyncOperation): void {
    this.operations.set(operation.id, operation);
  }

  async drainQueue(): Promise<void> {
    const pending = this.getPending();
    
    for (const op of pending) {
      try {
        await this.processOperation(op);
        this.markCompleted(op.id);
      } catch (error) {
        this.markFailed(op.id, error);
        break; // Stop on first failure
      }
    }
  }

  private async processOperation(op: SyncOperation) {
    switch (op.type) {
      case 'push':
        await syncAdapter.push(op.changes);
        break;
      case 'pull':
        await syncAdapter.pull();
        break;
    }
  }
}
```

**Usage**:
```typescript
// When offline
if (!isOnline) {
  queue.enqueue({
    id: generateId(),
    type: 'push',
    changes: [transaction],
    status: 'pending',
  });
}

// When back online
window.addEventListener('online', async () => {
  await queue.drainQueue();
  await syncEngine.sync();
});
```

### Pattern 3: Retry with Exponential Backoff

Retry failed operations with increasing delays:

```typescript
// src/core/offline/retry-strategy.ts
export class RetryStrategy {
  private maxRetries = 5;
  private baseDelay = 1000; // 1 second

  async execute<T>(
    operation: () => Promise<T>,
    attemptNumber: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attemptNumber >= this.maxRetries) {
        throw error;
      }

      const delay = this.calculateDelay(attemptNumber);
      await this.sleep(delay);

      return this.execute(operation, attemptNumber + 1);
    }
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return this.baseDelay * Math.pow(2, attempt);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Usage**:
```typescript
const retry = new RetryStrategy();

try {
  await retry.execute(async () => {
    return await syncAdapter.push(changes);
  });
} catch (error) {
  console.error('Failed after 5 retries:', error);
  showError('Sync failed. Please try again later.');
}
```

### Pattern 4: Conflict-Free Data Structures

Use CRDTs or timestamps to avoid conflicts:

```typescript
// Last-Write-Wins strategy using timestamps
interface Entity {
  id: string;
  updatedAt: number;  // Unix timestamp
  version: number;    // Incremental version
}

function merge(local: Entity, remote: Entity): Entity {
  // Simple LWW: choose the one updated most recently
  return local.updatedAt > remote.updatedAt ? local : remote;
}

// Version-based merging
function mergeByVersion(local: Entity, remote: Entity): Entity {
  if (local.version > remote.version) {
    return local;
  } else if (remote.version > local.version) {
    return remote;
  } else {
    // Same version but different data = conflict
    return resolveConflict(local, remote);
  }
}
```

### Pattern 5: Change Tracking

Track all changes for sync:

```typescript
// src/core/sync/change-tracker.ts
export class ChangeTracker {
  private changes: Map<string, Change> = new Map();

  track<T extends Entity>(
    entityType: EntityType,
    operation: 'create' | 'update' | 'delete',
    entity: T
  ): Change<T> {
    const change: Change<T> = {
      id: generateId(),
      entityType,
      operation,
      entity,
      timestamp: Date.now(),
      clientId: this.clientId,
      synced: false,
    };

    this.changes.set(change.id, change);
    return change;
  }

  getUnsynced(): Change[] {
    return Array.from(this.changes.values())
      .filter(c => !c.synced);
  }

  markSynced(changeIds: string[]): void {
    changeIds.forEach(id => {
      const change = this.changes.get(id);
      if (change) change.synced = true;
    });
  }
}
```

**Usage**:
```typescript
// Track every mutation
await repo.create(transaction);
tracker.track('transaction', 'create', transaction);

await repo.update(transaction.id, updates);
tracker.track('transaction', 'update', updatedTransaction);

await repo.delete(transaction.id);
tracker.track('transaction', 'delete', transaction);

// Later: Sync unsynced changes
const changes = tracker.getUnsynced();
await syncAdapter.push(changes);
tracker.markSynced(changes.map(c => c.id));
```

### Pattern 6: Delta Sync

Only sync changes since last sync:

```typescript
// Pull only recent changes
async function deltaSync() {
  const lastSyncTime = await getLastSyncTime();
  
  // Fetch only changes after lastSyncTime
  const remoteChanges = await syncAdapter.pullSince(lastSyncTime);
  
  // Apply changes to local DB
  for (const change of remoteChanges) {
    await applyRemoteChange(change);
  }
  
  // Update last sync time
  await setLastSyncTime(Date.now());
}

// Firestore query example
const q = query(
  collection(db, 'transactions'),
  where('workspaceId', '==', workspaceId),
  where('lastSyncedAt', '>', lastSyncTime),
  orderBy('lastSyncedAt', 'asc')
);
```

**Benefits**:
- Faster syncs
- Less bandwidth
- Lower cloud costs

### Pattern 7: Soft Deletes

Never hard delete, use soft deletes for sync:

```typescript
interface Entity {
  id: string;
  deletedAt?: number;  // Soft delete timestamp
}

// Soft delete
async function deleteTransaction(id: string) {
  await repo.update(id, { 
    deletedAt: Date.now() 
  });
  
  // Track for sync
  tracker.track('transaction', 'delete', transaction);
}

// Query only non-deleted
async function getTransactions() {
  return db.transactions
    .where('workspaceId').equals(workspaceId)
    .filter(tx => !tx.deletedAt)
    .toArray();
}

// Cleanup old soft-deletes (after 90 days)
async function cleanup() {
  const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
  
  await db.transactions
    .where('deletedAt').below(cutoff)
    .delete();
}
```

### Pattern 8: Sync State Management

Expose sync state to UI:

```typescript
// src/features/sync/hooks/use-sync-status.ts
export function useSyncStatus() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingChanges: 0,
    failedChanges: 0,
    conflicts: 0,
    lastSyncTime: undefined,
  });

  useEffect(() => {
    // Subscribe to sync engine events
    const unsubscribe = syncEngine.on('stateChange', (state) => {
      setSyncState(state);
    });

    return unsubscribe;
  }, []);

  return syncState;
}
```

**Usage in UI**:
```typescript
function SyncIndicator() {
  const syncState = useSyncStatus();

  return (
    <div>
      {syncState.isSyncing && <Spinner />}
      {!syncState.isOnline && <OfflineBadge />}
      {syncState.conflicts > 0 && <ConflictBadge />}
    </div>
  );
}
```

## Testing Offline Scenarios

### Test 1: Create While Offline

```typescript
test('should queue transaction when offline', async () => {
  // Simulate offline
  navigator.onLine = false;
  
  // Create transaction
  const tx = await service.create({ amount: 100 });
  
  // Should exist locally
  expect(await repo.findById(tx.id)).toBeDefined();
  
  // Should be queued for sync
  expect(queue.getPending()).toHaveLength(1);
  
  // Simulate online
  navigator.onLine = true;
  window.dispatchEvent(new Event('online'));
  
  // Should sync
  await waitFor(() => {
    expect(queue.getPending()).toHaveLength(0);
  });
});
```

### Test 2: Conflict Resolution

```typescript
test('should resolve conflicts with last-write-wins', async () => {
  const local = { id: '1', amount: 100, updatedAt: 1000 };
  const remote = { id: '1', amount: 200, updatedAt: 2000 };
  
  const conflicts = resolver.detectConflicts(local, remote);
  expect(conflicts).toHaveLength(1);
  
  const resolved = resolver.resolve(conflicts[0], 'last-write-wins');
  expect(resolved.amount).toBe(200); // Remote is newer
});
```

### Test 3: Sync After Disconnect

```typescript
test('should sync when reconnecting', async () => {
  // Create while offline
  navigator.onLine = false;
  await service.create({ amount: 100 });
  await service.create({ amount: 200 });
  
  // Verify queued
  expect(tracker.getUnsynced()).toHaveLength(2);
  
  // Go online
  navigator.onLine = true;
  await syncEngine.sync();
  
  // Verify synced
  expect(tracker.getUnsynced()).toHaveLength(0);
});
```

## Common Pitfalls

### ❌ Pitfall 1: Blocking UI on Network Calls

```typescript
// ❌ Bad: Blocks UI
async function createTransaction(data) {
  await api.post('/transactions', data);  // Waits for network
  await loadTransactions();  // More waiting
}

// ✅ Good: Optimistic update
async function createTransaction(data) {
  const tx = { ...data, id: generateId() };
  await db.transactions.add(tx);  // Instant
  syncEngine.trackChange('transaction', 'create', tx);  // Background
}
```

### ❌ Pitfall 2: Not Handling Network Errors

```typescript
// ❌ Bad: Throws error, loses data
async function sync() {
  await api.push(changes);  // Fails if offline
}

// ✅ Good: Queue and retry
async function sync() {
  if (!navigator.onLine) {
    queue.enqueue({ type: 'push', changes });
    return;
  }
  
  try {
    await api.push(changes);
  } catch (error) {
    if (isRetryable(error)) {
      queue.enqueue({ type: 'push', changes });
    } else {
      throw error;
    }
  }
}
```

### ❌ Pitfall 3: Ignoring Conflicts

```typescript
// ❌ Bad: Overwrites remote data
async function sync() {
  await api.push(localChanges);  // Clobbers remote
}

// ✅ Good: Detect and resolve conflicts
async function sync() {
  const remoteChanges = await api.pull();
  const conflicts = detectConflicts(localChanges, remoteChanges);
  
  if (conflicts.length > 0) {
    const resolved = await resolveConflicts(conflicts);
    await api.push(resolved);
  } else {
    await api.push(localChanges);
  }
}
```

### ❌ Pitfall 4: Trusting navigator.onLine

```typescript
// ❌ Bad: navigator.onLine can lie
if (navigator.onLine) {
  await api.sync();  // May still fail
}

// ✅ Good: Always try-catch
try {
  await api.sync();
} catch (error) {
  queue.enqueue({ type: 'sync' });
}
```

## Best Practices

### 1. ✅ Always Update Local DB First

```typescript
// User sees instant update
await db.transactions.add(transaction);

// Sync happens in background
syncEngine.trackChange('transaction', 'create', transaction);
```

### 2. ✅ Use Timestamps for Ordering

```typescript
interface Entity {
  createdAt: number;  // When created
  updatedAt: number;  // When last modified
  lastSyncedAt?: number;  // When last synced
}
```

### 3. ✅ Show Sync Status to Users

```typescript
<SyncStatusBadge 
  status={syncState.isSyncing ? 'syncing' : 'synced'}
  lastSync={syncState.lastSyncTime}
/>
```

### 4. ✅ Batch Operations

```typescript
// ❌ Bad: Many small syncs
for (const tx of transactions) {
  await syncAdapter.push([tx]);
}

// ✅ Good: One batch
await syncAdapter.push(transactions);
```

### 5. ✅ Handle Quota Limits

```typescript
const stats = await storageManager.getStats();

if (stats.percentage > 90) {
  // Cleanup old data
  await db.clearSoftDeleted(workspaceId, 90);
  
  // Archive old transactions
  await db.archiveOldTransactions(workspaceId, 2);
}
```

### 6. ✅ Test Offline Scenarios

```typescript
describe('Offline scenarios', () => {
  beforeEach(() => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
  });

  it('should work offline', async () => {
    // Your tests...
  });
});
```

## Resources

- [Offline First](https://offlinefirst.org/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [CRDTs](https://crdt.tech/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)

---

**Last Updated**: December 2025  
**Version**: Phase 4 Complete
