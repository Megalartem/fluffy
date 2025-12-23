/**
 * Firebase Sync Adapter
 *
 * Bridges ICloudProvider to the SyncEngine via SyncAdapter interface.
 */

import { BaseSyncAdapter, type SyncAdapter } from "../sync/sync-adapter";
import type { ConflictStrategy } from "../sync/conflict-resolver";
import type { Change, Conflict, SyncResult } from "../sync/types";
import type { ICloudProvider } from "./provider";

export class FirebaseSyncAdapter extends BaseSyncAdapter implements SyncAdapter {
  private provider: ICloudProvider;

  constructor(provider: ICloudProvider) {
    super();
    this.provider = provider;
  }

  async push(changes: Change[]): Promise<SyncResult> {
    const startedAt = Date.now();
    await this.ensureConnected();

    try {
      this.emit("status", { meta: { phase: "push", changes: changes.length } });

      // Push changes to Firestore with sync metadata
      // TODO: Replace with actual Firestore batch write
      // const db = getFirestore();
      // const batch = writeBatch(db);
      // for (const change of changes) {
      //   const docRef = doc(db, change.entityType + 's', change.entity.id);
      //   batch.set(docRef, {
      //     ...change.entity,
      //     syncStatus: 'synced',
      //     lastSyncedAt: Date.now(),
      //     syncedBy: this.provider.name,
      //   }, { merge: true });
      // }
      // await batch.commit();

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result: SyncResult = {
        operationId: `push-${startedAt}`,
        synced: changes.length,
        conflicts: [],
        errors: [],
        duration: Date.now() - startedAt,
        timestamp: Date.now(),
      };

      this.emit("synced", { syncedCount: result.synced });
      return result;
    } catch (error) {
      this.emit("error", { error });
      throw error;
    }
  }

  async pull(): Promise<Change[]> {
    const startedAt = Date.now();
    await this.ensureConnected();

    try {
      this.emit("status", { meta: { phase: "pull" } });

      // Pull all changes from Firestore (full sync)
      // TODO: Replace with actual Firestore queries
      // const db = getFirestore();
      // const collections = ['transactions', 'budgets', 'categories', 'goals', 'settings'];
      // const remoteChanges: Change[] = [];
      // 
      // for (const collectionName of collections) {
      //   const q = query(
      //     collection(db, collectionName),
      //     where('workspaceId', '==', currentWorkspaceId)
      //   );
      //   const snapshot = await getDocs(q);
      //   snapshot.forEach((doc) => {
      //     remoteChanges.push({
      //       id: doc.id,
      //       entityType: collectionName.slice(0, -1) as EntityType,
      //       operation: 'update',
      //       entity: doc.data() as any,
      //       timestamp: doc.data().lastSyncedAt || Date.now(),
      //       clientId: 'remote',
      //       synced: true,
      //     });
      //   });
      // }

      const remoteChanges: Change[] = [];

      this.emit("synced", { syncedCount: remoteChanges.length, meta: { duration: Date.now() - startedAt } });
      return remoteChanges;
    } catch (error) {
      this.emit("error", { error });
      throw error;
    }
  }

  async pullSince(since: number): Promise<Change[]> {
    const startedAt = Date.now();
    await this.ensureConnected();

    try {
      this.emit("status", { meta: { phase: "pullSince", since } });

      // Delta pull: fetch only changes since last sync timestamp
      // TODO: Replace with actual Firestore queries filtering by lastSyncedAt
      // const db = getFirestore();
      // const collections = ['transactions', 'budgets', 'categories', 'goals', 'settings'];
      // const remoteChanges: Change[] = [];
      // 
      // for (const collectionName of collections) {
      //   const q = query(
      //     collection(db, collectionName),
      //     where('workspaceId', '==', currentWorkspaceId),
      //     where('lastSyncedAt', '>', since),
      //     orderBy('lastSyncedAt', 'asc')
      //   );
      //   const snapshot = await getDocs(q);
      //   snapshot.forEach((doc) => {
      //     const data = doc.data();
      //     remoteChanges.push({
      //       id: doc.id,
      //       entityType: collectionName.slice(0, -1) as EntityType,
      //       operation: data.deletedAt ? 'delete' : 'update',
      //       entity: data as any,
      //       timestamp: data.lastSyncedAt || Date.now(),
      //       clientId: data.syncedBy || 'remote',
      //       synced: true,
      //     });
      //   });
      // }

      const remoteChanges: Change[] = [];

      this.emit("synced", { syncedCount: remoteChanges.length, meta: { duration: Date.now() - startedAt, since } });
      return remoteChanges;
    } catch (error) {
      this.emit("error", { error });
      throw error;
    }
  }

  async resolveConflict(conflicts: Conflict[], strategy: ConflictStrategy): Promise<void> {
    await this.ensureConnected();

    try {
      this.emit("status", { meta: { phase: "resolve", conflicts: conflicts.length, strategy } });

      // Resolve conflicts by writing resolved entities to Firestore
      // TODO: Replace with actual conflict resolution and Firestore updates
      // const db = getFirestore();
      // const batch = writeBatch(db);
      // 
      // for (const conflict of conflicts) {
      //   const resolver = new ConflictResolver();
      //   const resolved = resolver.resolve(conflict, strategy);
      //   const docRef = doc(db, conflict.entityType + 's', resolved.id);
      //   batch.set(docRef, {
      //     ...resolved,
      //     syncStatus: 'synced',
      //     lastSyncedAt: Date.now(),
      //     conflictResolvedAt: Date.now(),
      //     conflictStrategy: strategy,
      //   }, { merge: true });
      // }
      // await batch.commit();

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50));

      this.emit("synced", { syncedCount: conflicts.length, meta: { strategy } });
    } catch (error) {
      this.emit("error", { error });
      throw error;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.provider.isConnected()) {
      await this.provider.connect();
      this.emit("connected", { meta: { provider: this.provider.name } });
    }
  }
}
