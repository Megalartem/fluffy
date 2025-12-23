/**
 * Sync Adapter
 *
 * Abstraction layer between the SyncEngine and concrete cloud providers.
 */

import type { ConflictStrategy } from "./conflict-resolver";
import type { Change, Conflict, SyncResult } from "./types";

export type SyncAdapterEvent = "connected" | "disconnected" | "synced" | "error" | "status";

export interface SyncAdapterEventPayload {
  type: SyncAdapterEvent;
  timestamp: number;
  error?: unknown;
  meta?: Record<string, unknown>;
  syncedCount?: number;
}

export type SyncAdapterListener = (payload: SyncAdapterEventPayload) => void;

export interface SyncAdapter {
  push(changes: Change[]): Promise<SyncResult>;
  pull(): Promise<Change[]>;
  pullSince?(since: number): Promise<Change[]>;
  resolveConflict(conflicts: Conflict[], strategy: ConflictStrategy): Promise<void>;
  on(event: SyncAdapterEvent, listener: SyncAdapterListener): () => void;
}

export abstract class BaseSyncAdapter implements SyncAdapter {
  private listeners = new Map<SyncAdapterEvent, Set<SyncAdapterListener>>();

  abstract push(changes: Change[]): Promise<SyncResult>;
  abstract pull(): Promise<Change[]>;
  pullSince?(since: number): Promise<Change[]>;
  abstract resolveConflict(conflicts: Conflict[], strategy: ConflictStrategy): Promise<void>;

  on(event: SyncAdapterEvent, listener: SyncAdapterListener): () => void {
    const listeners = this.listeners.get(event) ?? new Set<SyncAdapterListener>();
    listeners.add(listener);
    this.listeners.set(event, listeners);

    return () => {
      const current = this.listeners.get(event);
      current?.delete(listener);
    };
  }

  protected emit(event: SyncAdapterEvent, payload: Partial<SyncAdapterEventPayload> = {}): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const fullPayload: SyncAdapterEventPayload = {
      type: event,
      timestamp: Date.now(),
      ...payload,
    };

    listeners.forEach((listener) => listener(fullPayload));
  }
}

/**
 * Utility: attach console logging to adapter events (placeholder for real telemetry).
 */
export function attachSyncAdapterConsoleLogging(adapter: SyncAdapter, label: string = "sync") {
  const offConnected = adapter.on("connected", (p) => console.info(`[${label}] connected`, p.meta));
  const offDisconnected = adapter.on("disconnected", (p) => console.info(`[${label}] disconnected`, p.meta));
  const offStatus = adapter.on("status", (p) => console.debug(`[${label}] status`, p.meta));
  const offSynced = adapter.on("synced", (p) => console.info(`[${label}] synced`, p.syncedCount, p.meta));
  const offError = adapter.on("error", (p) => console.error(`[${label}] error`, p.error, p.meta));

  return () => {
    offConnected();
    offDisconnected();
    offStatus();
    offSynced();
    offError();
  };
}
