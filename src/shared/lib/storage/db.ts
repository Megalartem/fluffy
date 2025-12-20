import Dexie, { Table } from "dexie";
import type { AppSettings } from "@/features/settings/model/types";
import type { Transaction } from "@/features/transactions/model/types";
import type { Category } from "@/core/domain/category";

export type DbMeta = {
  key: string;
  value: string;
  updatedAt: string;
};

export class BudgetDB extends Dexie {
  meta!: Table<DbMeta, string>;
  settings!: Table<AppSettings, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;

  constructor() {
    super("BudgetDB");

    // v1
    this.version(1).stores({
      meta: "&key",
      settings: "&id, workspaceId",
    });

    // v2 (Slice 2): transactions + categories
    this.version(2).stores({
      meta: "&key",
      settings: "&id, workspaceId",
      transactions: "&id, workspaceId, date, type, categoryId, deletedAt",
      categories: "&id, workspaceId, type, order, deletedAt",
    });
  }
}

export const db = new BudgetDB();

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  // YYYY-MM-DD in local time
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function ensureDbInitialized(): Promise<void> {
  const key = "schemaVersion";
  const existing = await db.meta.get(key);
  if (!existing) {
    await db.meta.put({ key, value: "2", updatedAt: nowIso() });
    return;
  }
  // если обновились со старой версии — перезапишем версию в meta
  if (existing.value !== "2") {
    await db.meta.put({ key, value: "2", updatedAt: nowIso() });
  }
}
