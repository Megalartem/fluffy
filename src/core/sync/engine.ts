/**
 * Sync Engine
 *
 * Main sync orchestration engine
 */

import type { SyncAdapter } from "./sync-adapter";
import type { Entity, Change, Conflict, SyncOperation, SyncResult, SyncError, SyncState } from "./types";
import { ChangeTracker } from "./change-tracker";
import { ConflictResolver, type ConflictStrategy } from "./conflict-resolver";
import { OperationQueue } from "./queue";

export class SyncEngine {
  private changeTracker: ChangeTracker;
  private conflictResolver: ConflictResolver;
  private operationQueue: OperationQueue;
  private provider: SyncAdapter;
  private clientId: string;
  private state: SyncState;
  private retryCount: Map<string, number> = new Map();
  private maxRetries: number = 3;
  private conflictStrategy: ConflictStrategy = "last-write-wins";

  constructor(clientId: string, provider: SyncAdapter) {
    this.clientId = clientId;
    this.provider = provider;
    this.changeTracker = new ChangeTracker(clientId);
    this.conflictResolver = new ConflictResolver();
    this.operationQueue = new OperationQueue();

    this.state = {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingChanges: 0,
      failedChanges: 0,
      conflicts: 0,
      lastSyncTime: undefined,
    };

    // Listen to online/offline events
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  /**
   * Track a change
   */
  trackChange<T extends Entity>(
    entityType: any,
    operation: "create" | "update" | "delete",
    entity: T
  ): void {
    this.changeTracker.track(entityType, operation, entity);
    this.updateState();
  }

  /**
   * Perform full sync (push + pull)
   */
  async sync(): Promise<SyncResult> {
    const operationId = `${this.clientId}-${Date.now()}`;

    if (this.state.isSyncing) {
      throw new Error("Sync already in progress");
    }

    if (!this.state.isOnline) {
      const changes = this.changeTracker.getUnsynced();
      if (changes.length > 0) {
        this.enqueueOperation("push", changes);
      }
      return {
        operationId,
        synced: 0,
        conflicts: [],
        errors: [
          {
            id: `${operationId}-offline`,
            entityId: changes[0]?.entity.id || "n/a",
            entityType: changes[0]?.entityType || ("transaction" as any),
            message: "Offline: operation enqueued",
            code: "OFFLINE_ENQUEUED",
            retryable: true,
            timestamp: Date.now(),
          },
        ],
        duration: 0,
        timestamp: Date.now(),
      };
    }

    this.state.isSyncing = true;
    const syncStartedAt = Date.now();

    try {
      // Push local changes
      const changes = this.changeTracker.getUnsynced();
      const pushResult = await this.provider.push(changes);

      // Mark changes as synced
      const syncedIds = changes.map((c) => c.id);
      this.changeTracker.markSynced(syncedIds);

      // Pull remote changes
      const since = this.state.lastSyncTime;
      const remoteChanges =
        typeof (this.provider as any).pullSince === "function" && since
          ? await (this.provider as any).pullSince(since)
          : await this.provider.pull();

      // Check for conflicts and resolve if strategy is set
      const conflicts = this.detectConflicts(remoteChanges);
      if (conflicts.length > 0) {
        this.state.conflicts = conflicts.length;
        try {
          await this.provider.resolveConflict(conflicts, this.conflictStrategy);
          this.state.conflicts = 0;
        } catch (e) {
          // keep conflicts in state if resolution fails
        }
      }

      this.changeTracker.clearSynced();
      this.updateState();

      return {
        operationId,
        synced: changes.length,
        conflicts,
        errors: [],
        duration: Date.now() - syncStartedAt,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.state.failedChanges = this.changeTracker.getUnsynced().length;
      throw error;
    } finally {
      this.state.isSyncing = false;
      this.state.lastSyncTime = syncStartedAt;
    }
  }

  /**
   * Push only local changes
   */
  async push(): Promise<SyncResult> {
    const changes = this.changeTracker.getUnsynced();

    if (changes.length === 0) {
      return {
        operationId: `${this.clientId}-${Date.now()}`,
        synced: 0,
        conflicts: [],
        errors: [],
        duration: 0,
        timestamp: Date.now(),
      };
    }

    if (!this.state.isOnline) {
      this.enqueueOperation("push", changes);
      return {
        operationId: `${this.clientId}-${Date.now()}`,
        synced: 0,
        conflicts: [],
        errors: [
          {
            id: `${this.clientId}-${Date.now()}-offline`,
            entityId: changes[0]?.entity.id || "n/a",
            entityType: changes[0]?.entityType || ("transaction" as any),
            message: "Offline: push enqueued",
            code: "OFFLINE_ENQUEUED",
            retryable: true,
            timestamp: Date.now(),
          },
        ],
        duration: 0,
        timestamp: Date.now(),
      };
    }

    try {
      const result = await this.provider.push(changes);
      this.changeTracker.markSynced(changes.map((c) => c.id));
      this.changeTracker.clearSynced();
      this.updateState();
      return result;
    } catch (error) {
      this.state.failedChanges = changes.length;
      throw error;
    }
  }

  /**
   * Pull remote changes only
   */
  async pull(): Promise<SyncResult> {
    try {
      const since = this.state.lastSyncTime;
      const remoteChanges =
        typeof (this.provider as any).pullSince === "function" && since
          ? await (this.provider as any).pullSince(since)
          : await this.provider.pull();
      const conflicts = this.detectConflicts(remoteChanges);

      this.state.conflicts = conflicts.length;
      this.updateState();

      return {
        operationId: `${this.clientId}-${Date.now()}`,
        synced: remoteChanges.length,
        conflicts,
        errors: [],
        duration: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Detect conflicts in remote changes
   */
  private detectConflicts(remoteChanges: Change[]): Conflict[] {
    const conflicts: Conflict[] = [];

    remoteChanges.forEach((remoteChange) => {
      const localChanges = this.changeTracker.getChangesForEntity(
        remoteChange.entity.id
      );

      localChanges.forEach((localChange) => {
        const detected = this.conflictResolver.detectConflicts(
          localChange.entity as any,
          remoteChange.entity as any
        );
        conflicts.push(...detected);
      });
    });

    return conflicts;
  }

  /**
   * Resolve conflicts
   */
  async resolveConflicts(
    conflicts: Conflict[],
    strategy: ConflictStrategy
  ): Promise<void> {
    await this.provider.resolveConflict(conflicts, strategy);
    this.state.conflicts = 0;
    this.updateState();
  }

  /**
   * Retry failed operation
   */
  async retryOperation(operationId: string): Promise<boolean> {
    if (!this.operationQueue.retry(operationId)) {
      return false;
    }

    const retries = this.retryCount.get(operationId) || 0;
    if (retries >= this.maxRetries) {
      return false;
    }

    this.retryCount.set(operationId, retries + 1);
    await this.sync();
    return true;
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.state.isOnline = true;
    // Drain queued operations, then auto-sync
    this.drainQueue()
      .then(() => this.sync())
      .catch(console.error);
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.state.isOnline = false;
  }

  /**
   * Update state based on tracker
   */
  private updateState(): void {
    const stats = this.changeTracker.getStats();
    this.state.pendingChanges = stats.unsyncedChanges;
  }

  /**
   * Get engine statistics
   */
  getStats() {
    return {
      tracker: this.changeTracker.getStats(),
      queue: this.operationQueue.getStats(),
      state: this.state,
    };
  }

  /**
   * Reset engine
   */
  reset(): void {
    this.changeTracker.reset();
    this.operationQueue.clear();
    this.retryCount.clear();
    this.state = {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingChanges: 0,
      failedChanges: 0,
      conflicts: 0,
      lastSyncTime: undefined,
    };
  }

  /**
   * Configure conflict strategy
   */
  setConflictStrategy(strategy: ConflictStrategy): void {
    this.conflictStrategy = strategy;
  }

  getConflictStrategy(): ConflictStrategy {
    return this.conflictStrategy;
  }

  /**
   * Enqueue a sync operation (used when offline)
   */
  private enqueueOperation(type: SyncOperation["type"], changes: Change[]): void {
    const op: SyncOperation = {
      id: `${this.clientId}-${Date.now()}-${type}`,
      type,
      changes,
      conflicts: [],
      resolutions: [],
      status: "pending",
      startedAt: Date.now(),
    } as any;
    this.operationQueue.enqueue(op);
  }

  /**
   * Process queued operations when back online
   */
  private async drainQueue(): Promise<void> {
    let op: SyncOperation | undefined;
    // Process sequentially to preserve order
    // Limit iterations to avoid infinite loops
    let safeguard = 100;
    while ((op = this.operationQueue.next()) && safeguard-- > 0) {
      try {
        this.operationQueue.updateStatus(op.id, "in-progress");
        if (op.type === "push") {
          await this.provider.push(op.changes);
        } else {
          // pull or pull-rebase
          if (op.type === "pull-rebase") {
            // full pull for rebase scenarios
            await this.provider.pull();
          } else {
            await this.provider.pull();
          }
        }
        this.operationQueue.updateStatus(op.id, "completed");
      } catch (e: any) {
        this.operationQueue.updateStatus(op.id, "failed", String(e?.message || e));
        break; // stop on first failure
      }
    }
    // cleanup completed ops
    this.operationQueue.clearCompleted();
  }
}
