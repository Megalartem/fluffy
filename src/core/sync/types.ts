/**
 * Sync Engine Types
 *
 * Core types for the sync system
 */

export type EntityType = "transaction" | "budget" | "category" | "goal" | "setting";

export interface Entity {
  id: string;
  workspaceId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  version: number;
}

export interface Change<T extends Entity = Entity> {
  id: string;
  entityType: EntityType;
  operation: "create" | "update" | "delete";
  entity: T;
  timestamp: number;
  clientId: string;
  synced?: boolean;
}

export interface Conflict<T extends Entity = Entity> {
  id: string;
  entityType: EntityType;
  field: string;
  local: T;
  remote: T;
  localValue?: any;
  remoteValue?: any;
  timestamp: number;
}

export interface ConflictResolution {
  conflictId: string;
  strategy: "local" | "remote" | "merge" | "manual";
  resolvedValue?: any;
  timestamp: number;
}

export interface SyncOperation {
  id: string;
  type: "push" | "pull" | "pull-rebase";
  changes: Change[];
  conflicts: Conflict[];
  resolutions: ConflictResolution[];
  status: "pending" | "in-progress" | "completed" | "failed";
  error?: string;
  startedAt: number;
  completedAt?: number;
}

export interface SyncResult {
  operationId: string;
  synced: number;
  conflicts: Conflict[];
  errors: SyncError[];
  duration: number;
  timestamp: number;
}

export interface SyncError {
  id: string;
  entityId: string;
  entityType: EntityType;
  message: string;
  code: string;
  retryable: boolean;
  timestamp: number;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: number;
  nextSyncTime?: number;
  pendingChanges: number;
  failedChanges: number;
  conflicts: number;
}

export interface ChangeLog {
  id: string;
  changes: Change[];
  version: number;
  timestamp: number;
  clientId: string;
}
