/**
 * Conflict Resolver
 *
 * Resolves conflicts between local and remote versions
 */

import type { Conflict, ConflictResolution, Entity } from "./types";

export type ConflictStrategy = "local" | "remote" | "merge" | "last-write-wins";

export interface IConflictResolver {
  resolve<T extends Entity>(
    conflict: Conflict<T>,
    strategy: ConflictStrategy
  ): T;

  detectConflicts<T extends Entity>(local: T, remote: T): Conflict<T>[];

  mergeFields<T extends Entity>(local: T, remote: T): T;
}

export class ConflictResolver implements IConflictResolver {
  /**
   * Resolve a conflict using specified strategy
   */
  resolve<T extends Entity>(
    conflict: Conflict<T>,
    strategy: ConflictStrategy
  ): T {
    switch (strategy) {
      case "local":
        return conflict.local;

      case "remote":
        return conflict.remote;

      case "merge":
        return this.mergeFields(conflict.local, conflict.remote);

      case "last-write-wins":
        return conflict.local.updatedAt > conflict.remote.updatedAt
          ? conflict.local
          : conflict.remote;

      default:
        return conflict.remote;
    }
  }

  /**
   * Detect conflicts between local and remote versions
   */
  detectConflicts<T extends Entity>(local: T, remote: T): Conflict<T>[] {
    const conflicts: Conflict<T>[] = [];

    // Check version mismatch
    if (local.version !== remote.version) {
      conflicts.push({
        id: `${local.id}-version`,
        entityType: "transaction", // TODO: infer from entity
        field: "version",
        local,
        remote,
        localValue: local.version,
        remoteValue: remote.version,
        timestamp: Date.now(),
      });
    }

    // Check all fields for differences
    const localKeys = Object.keys(local) as (keyof T)[];
    localKeys.forEach((key) => {
      if (
        key === "id" ||
        key === "workspaceId" ||
        key === "createdAt"
      ) {
        return; // Skip immutable fields
      }

      if (
        JSON.stringify(local[key]) !==
        JSON.stringify((remote as any)[key])
      ) {
        conflicts.push({
          id: `${local.id}-${String(key)}`,
          entityType: "transaction", // TODO: infer
          field: String(key),
          local,
          remote,
          localValue: local[key],
          remoteValue: (remote as any)[key],
          timestamp: Date.now(),
        });
      }
    });

    return conflicts;
  }

  /**
   * Merge fields from local and remote
   * Priority: updatedAt > local changes > remote
   */
  mergeFields<T extends Entity>(local: T, remote: T): T {
    const merged = { ...remote };

    // For each field in local, check if it's newer
    const localKeys = Object.keys(local) as (keyof T)[];
    localKeys.forEach((key) => {
      if (key === "updatedAt") {
        // Use the later timestamp
        merged.updatedAt = Math.max(local.updatedAt, remote.updatedAt);
        return;
      }

      if (
        key === "id" ||
        key === "workspaceId" ||
        key === "createdAt"
      ) {
        return; // Keep remote values for these
      }

      // If local is newer, use local value
      if (local.updatedAt > remote.updatedAt) {
        (merged as any)[key] = local[key];
      }
    });

    // Increment version for merged entity
    merged.version = Math.max(local.version, remote.version) + 1;

    return merged;
  }

  /**
   * Create resolution record
   */
  createResolution(
    conflictId: string,
    strategy: ConflictStrategy,
    resolvedValue?: any
  ): ConflictResolution {
    // Map last-write-wins to merge for resolution tracking
    const resolutionStrategy = strategy === "last-write-wins" ? "merge" : strategy;
    
    return {
      conflictId,
      strategy: resolutionStrategy,
      resolvedValue,
      timestamp: Date.now(),
    };
  }
}
