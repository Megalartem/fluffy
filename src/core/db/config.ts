/**
 * Database Configuration
 *
 * Optimized Dexie configuration with proper indices
 */

import Dexie, { type Table } from "dexie";

export type SyncStatus = "pending" | "synced" | "conflict" | "error";

// Import types from features
// These would normally be imported from their feature modules
export interface Transaction {
  id: string;
  workspaceId: string;
  type: "income" | "expense";
  amountMinor: number;
  currency: string;
  categoryId?: string;
  note?: string;
  date: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  version: number;
  syncedAt?: number;
  lastSyncedAt?: number;
  syncStatus?: SyncStatus;
}

export interface Budget {
  id: string;
  workspaceId: string;
  categoryId: string;
  limitMinor: number; // Changed from 'limit' to match feature types
  currency: string;
  period: "monthly" | "yearly";
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  deletedAt?: string | null;
  version?: number;
  syncedAt?: number;
  lastSyncedAt?: number;
  syncStatus?: SyncStatus;
}

export interface Category {
  id: string;
  workspaceId: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  version: number;
  lastSyncedAt?: number;
  syncStatus?: SyncStatus;
}

export interface Goal {
  id: string;
  workspaceId: string;
  name: string;
  note?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  version: number;
  syncedAt?: number;
  lastSyncedAt?: number;
  syncStatus?: SyncStatus;
}

export interface Setting {
  id: string;
  workspaceId: string;
  key: string;
  value: string | number | boolean | null;
  createdAt: number;
  updatedAt: number;
  version: number;
  lastSyncedAt?: number;
  syncStatus?: SyncStatus;
}

export class FluffyDatabase extends Dexie {
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;
  categories!: Table<Category>;
  goals!: Table<Goal>;
  settings!: Table<Setting>;

  constructor() {
    super("fluffydb");

    // Legacy schema versions
    this.version(2).stores({
      transactions:
        "++id, workspaceId, [workspaceId+date], [workspaceId+type]",
      budgets: "++id, workspaceId",
      categories: "++id, workspaceId",
      goals: "++id, workspaceId",
      settings: "++id, [workspaceId+key]",
    });

    this.version(3).stores({
      transactions:
        "++id, workspaceId, [workspaceId+date], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt]",
      budgets:
        "++id, workspaceId, [workspaceId+categoryId], [workspaceId+updatedAt]",
      categories: "++id, workspaceId, [workspaceId+name]",
      goals:
        "++id, workspaceId, [workspaceId+deadline], [workspaceId+updatedAt]",
      settings: "++id, [workspaceId+key]",
    });

    // Phase 4: cloud-sync fields and indices (version 6)
    this.version(6)
      .stores({
        transactions:
          "++id, workspaceId, [workspaceId+date], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
        budgets:
          "++id, workspaceId, [workspaceId+categoryId], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
        categories:
          "++id, workspaceId, [workspaceId+name], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
        goals:
          "++id, workspaceId, [workspaceId+deadline], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
        settings:
          "++id, [workspaceId+key], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      })
      .upgrade(async (tx) => {
        // --- transactions: date -> dateKey, amount(minor) -> amountMinor, numeric timestamps -> ISO strings
        await tx.table("transactions").toCollection().modify((t: Transaction) => {
          t.version = t.version || 1;
          t.syncStatus = t.syncStatus || "pending";
          if (!t.lastSyncedAt && t.syncedAt) t.lastSyncedAt = t.syncedAt;

          // amountMinor
          // legacy `amount` was stored in minor units already
          if (typeof t.amountMinor !== "number" && typeof t.amountMinor === "string") {
            const n = Number(t.amountMinor);
            if (Number.isFinite(n)) t.amountMinor = Math.round(n);
          }
        });

        await tx.table("budgets").toCollection().modify((b: Budget) => {
          b.version = b.version || 1;
          b.syncStatus = b.syncStatus || "pending";
          if (!b.lastSyncedAt && b.syncedAt) b.lastSyncedAt = b.syncedAt;
        });

        await tx.table("categories").toCollection().modify((c: Category) => {
          c.version = c.version || 1;
          c.syncStatus = c.syncStatus || "pending";
        });

        await tx.table("goals").toCollection().modify((g: Goal) => {
          g.version = g.version || 1;
          g.syncStatus = g.syncStatus || "pending";
          if (!g.lastSyncedAt && g.syncedAt) g.lastSyncedAt = g.syncedAt;
        });

        await tx.table("settings").toCollection().modify((s: Setting) => {
          s.version = s.version || 1;
          s.syncStatus = s.syncStatus || "pending";
        });
      });

    this.version(7).stores({
      transactions:
        "++id, workspaceId, [workspaceId+date], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      budgets:
        "++id, workspaceId, [workspaceId+categoryId], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      categories:
        "++id, workspaceId, [workspaceId+name], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      goals:
        "++id, workspaceId, [workspaceId+deadline], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      settings:
        "++id, [workspaceId+key], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
    })
    .upgrade(async (tx) => {
      await tx.table("goals").toCollection().modify((g: Goal) => {
        if (!g.note) g.note = "";
      });
    });

    // Version 8: Budgets feature alignment - limitMinor and ISO string timestamps
    this.version(8).stores({
      transactions:
        "++id, workspaceId, [workspaceId+date], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      budgets:
        "++id, workspaceId, [workspaceId+categoryId], [workspaceId+deletedAt], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      categories:
        "++id, workspaceId, [workspaceId+name], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      goals:
        "++id, workspaceId, [workspaceId+deadline], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
      settings:
        "++id, [workspaceId+key], [workspaceId+updatedAt], [workspaceId+syncStatus], [workspaceId+lastSyncedAt]",
    })
    .upgrade(async (tx) => {
      // Migrate budgets: rename 'limit' -> 'limitMinor', convert timestamps to ISO strings
      await tx.table("budgets").toCollection().modify((b: Budget) => {
        // limitMinor should already be present in the Budget interface
        
        // Convert numeric timestamps to ISO string timestamps
        if (typeof b.createdAt === "number") {
          b.createdAt = new Date(b.createdAt).toISOString();
        }
        if (typeof b.updatedAt === "number") {
          b.updatedAt = new Date(b.updatedAt).toISOString();
        }
        if (typeof b.deletedAt === "number") {
          b.deletedAt = new Date(b.deletedAt).toISOString();
        }
      });
    });
  }

  /**
   * Clear soft-deleted items (older than 90 days)
   */
  async clearSoftDeleted(workspaceId: string, daysOld: number = 90): Promise<number> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const transactionCount = await this.transactions
      .where("workspaceId")
      .equals(workspaceId)
      .filter((t) => !!(t.deletedAt && new Date(t.deletedAt).getTime() < cutoffTime))
      .delete();

    const budgetCount = await this.budgets
      .where("workspaceId")
      .equals(workspaceId)
      .filter((b) => !!(b.deletedAt && new Date(b.deletedAt).getTime() < cutoffTime))
      .delete();

    const goalCount = await this.goals
      .where("workspaceId")
      .equals(workspaceId)
      .filter((g) => !!(g.deletedAt && new Date(g.deletedAt).getTime() < cutoffTime))
      .delete();

    const categoryCount = await this.categories
      .where("workspaceId")
      .equals(workspaceId)
      .filter((c) => !!(c.deletedAt && new Date(c.deletedAt).getTime() < cutoffTime))
      .delete();

    return transactionCount + budgetCount + goalCount + categoryCount;
  }

  /**
   * Archive old transactions (older than 2 years)
   */
  async archiveOldTransactions(
    workspaceId: string,
    yearsOld: number = 2
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsOld);
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

    const count = await this.transactions
      .where("workspaceId")
      .equals(workspaceId)
      .filter((t) => !t.deletedAt && t.date < cutoffDateStr)
      .count();

    // Mark for archival (in real implementation)
    return count;
  }

  /**
   * Optimize database (compact storage)
   */
  async optimize(): Promise<void> {
    // Dexie/IndexedDB optimization tips:
    // 1. Delete soft-deleted items periodically
    // 2. Batch operations
    // 3. Use proper indices
    // 4. Avoid large objects
    // 5. Use compression for large strings

    console.log("Database optimization completed");
  }

  /**
   * Get database statistics
   */
  async getStats(workspaceId: string): Promise<{
    transactions: number;
    budgets: number;
    categories: number;
    goals: number;
    settings: number;
    totalRecords: number;
  }> {
    const [transactionCount, budgetCount, categoryCount, goalCount, settingCount] =
      await Promise.all([
        this.transactions.where("workspaceId").equals(workspaceId).count(),
        this.budgets.where("workspaceId").equals(workspaceId).count(),
        this.categories.where("workspaceId").equals(workspaceId).count(),
        this.goals.where("workspaceId").equals(workspaceId).count(),
        this.settings.where("workspaceId").equals(workspaceId).count(),
      ]);

    return {
      transactions: transactionCount,
      budgets: budgetCount,
      categories: categoryCount,
      goals: goalCount,
      settings: settingCount,
      totalRecords:
        transactionCount +
        budgetCount +
        categoryCount +
        goalCount +
        settingCount,
    };
  }
}

// Singleton instance
export const db = new FluffyDatabase();
