/**
 * Operation Queue
 *
 * Manages sync operations queue for offline support
 */

import type { SyncOperation, Change } from "./types";

export class OperationQueue {
  private operations: Map<string, SyncOperation> = new Map();
  private queue: string[] = []; // Order of operations
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Add operation to queue
   */
  enqueue(operation: SyncOperation): void {
    if (this.operations.size >= this.maxSize) {
      // Remove oldest operation if at capacity
      const oldest = this.queue.shift();
      if (oldest) {
        this.operations.delete(oldest);
      }
    }

    this.operations.set(operation.id, operation);
    this.queue.push(operation.id);
  }

  /**
   * Get next pending operation
   */
  next(): SyncOperation | undefined {
    for (const id of this.queue) {
      const op = this.operations.get(id);
      if (op && op.status === "pending") {
        return op;
      }
    }
    return undefined;
  }

  /**
   * Update operation status
   */
  updateStatus(
    operationId: string,
    status: SyncOperation["status"],
    error?: string
  ): void {
    const op = this.operations.get(operationId);
    if (op) {
      op.status = status;
      if (error) {
        op.error = error;
      }
      if (status === "completed") {
        op.completedAt = Date.now();
      }
    }
  }

  /**
   * Get all pending operations
   */
  getPending(): SyncOperation[] {
    return Array.from(this.operations.values()).filter(
      (op) => op.status === "pending"
    );
  }

  /**
   * Get all failed operations
   */
  getFailed(): SyncOperation[] {
    return Array.from(this.operations.values()).filter(
      (op) => op.status === "failed"
    );
  }

  /**
   * Retry failed operation
   */
  retry(operationId: string): boolean {
    const op = this.operations.get(operationId);
    if (op && op.status === "failed") {
      op.status = "pending";
      op.error = undefined;
      return true;
    }
    return false;
  }

  /**
   * Clear completed operations
   */
  clearCompleted(): number {
    let cleared = 0;
    const idsToRemove: string[] = [];

    this.operations.forEach((op, id) => {
      if (op.status === "completed") {
        idsToRemove.push(id);
        cleared++;
      }
    });

    idsToRemove.forEach((id) => {
      this.operations.delete(id);
      const index = this.queue.indexOf(id);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
    });

    return cleared;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const ops = Array.from(this.operations.values());
    return {
      total: ops.length,
      pending: ops.filter((op) => op.status === "pending").length,
      inProgress: ops.filter((op) => op.status === "in-progress").length,
      completed: ops.filter((op) => op.status === "completed").length,
      failed: ops.filter((op) => op.status === "failed").length,
      queueSize: this.queue.length,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.operations.clear();
    this.queue = [];
  }
}
