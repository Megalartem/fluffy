/**
 * Change Tracker
 *
 * Tracks changes to entities for sync
 */

import type { Entity, Change, EntityType, ChangeLog } from "./types";

export class ChangeTracker {
  private changes: Map<string, Change> = new Map();
  private changeLog: ChangeLog[] = [];
  private clientId: string;
  private version: number = 1;
  private lastLogId: string = "";

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Track a change
   */
  track<T extends Entity>(
    entityType: EntityType,
    operation: "create" | "update" | "delete",
    entity: T
  ): Change<T> {
    const changeId = `${this.clientId}-${Date.now()}-${Math.random()}`;

    const change: Change<T> = {
      id: changeId,
      entityType,
      operation,
      entity,
      timestamp: Date.now(),
      clientId: this.clientId,
      synced: false,
    };

    this.changes.set(changeId, change);
    return change;
  }

  /**
   * Get all unsynced changes
   */
  getUnsynced(): Change[] {
    return Array.from(this.changes.values()).filter((c) => !c.synced);
  }

  /**
   * Mark changes as synced
   */
  markSynced(changeIds: string[]): void {
    changeIds.forEach((id) => {
      const change = this.changes.get(id);
      if (change) {
        change.synced = true;
      }
    });
  }

  /**
   * Get changes for a specific entity
   */
  getChangesForEntity(entityId: string): Change[] {
    return Array.from(this.changes.values()).filter(
      (c) => c.entity.id === entityId
    );
  }

  /**
   * Clear synced changes
   */
  clearSynced(): void {
    const unsynced = this.getUnsynced();
    this.changes.clear();
    unsynced.forEach((change) => {
      this.changes.set(change.id, change);
    });
  }

  /**
   * Export changelog
   */
  exportChangeLog(): ChangeLog {
    const logId = `${this.clientId}-${this.version}-${Date.now()}`;
    const log: ChangeLog = {
      id: logId,
      changes: this.getUnsynced(),
      version: this.version,
      timestamp: Date.now(),
      clientId: this.clientId,
    };

    this.changeLog.push(log);
    this.version++;
    this.lastLogId = logId;

    return log;
  }

  /**
   * Get changelog history
   */
  getChangeLogHistory(limit: number = 50): ChangeLog[] {
    return this.changeLog.slice(-limit);
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.changes.clear();
    this.changeLog = [];
    this.version = 1;
  }

  /**
   * Get tracker stats
   */
  getStats() {
    return {
      totalChanges: this.changes.size,
      unsyncedChanges: this.getUnsynced().length,
      syncedChanges: Array.from(this.changes.values()).filter((c) => c.synced)
        .length,
      logVersion: this.version,
      clientId: this.clientId,
    };
  }
}
