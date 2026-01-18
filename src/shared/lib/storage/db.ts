import Dexie, { Table } from "dexie";
import type { AppSettings } from "@/features/settings/model/types";
import type { Transaction } from "@/features/transactions/model/types";
import type { Category, CategoryColor } from "@/features/categories/model/types";
import type { MonthlyBudget } from "@/features/budgets/model/types";
import type { Goal } from "@/features/goals/model/types";
import { IconName } from "lucide-react/dynamic";




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
  budgets!: Table<MonthlyBudget, string>;
  goals!: Table<Goal, string>;



  constructor() {
    super("BudgetDB");

    this.version(1).stores({
      meta: "&key",
      settings: "&id, workspaceId",
    });

    this.version(2).stores({
      meta: "&key",
      settings: "&id, workspaceId",
      transactions: "&id, workspaceId, date, type, categoryId, deletedAt",
    });

    // v3: categories
    this.version(3).stores({
      meta: "&key",
      settings: "&id, workspaceId",
      transactions: "&id, workspaceId, date, type, categoryId, deletedAt",
      categories: "&id, workspaceId, type, order, deletedAt",
    });

    this.version(4).stores({
      meta: "&key",
      settings: "&id, workspaceId",
      transactions: "&id, workspaceId, date, type, categoryId, deletedAt",
      categories: "&id, workspaceId, type, order, deletedAt",
      budgets: "&id, workspaceId, month, deletedAt",
    });

    this.version(5).stores({
      meta: "&key",
      settings: "&id, workspaceId",
      transactions: "&id, workspaceId, date, type, categoryId, deletedAt",
      categories: "&id, workspaceId, type, order, deletedAt",
      budgets: "&id, workspaceId, month, deletedAt",
      goals: "&id, workspaceId, targetAmount, currentAmount, deadline, deletedAt",
    });

    // v6: align schema with new Transaction/Category models (dateKey, amountMinor, iconKey, colorKey, isArchived)
    this.version(6)
      .stores({
        meta: "&key",
        settings: "&id, workspaceId",

        // dateKey is the primary date field now
        transactions:
          "&id, workspaceId, dateKey, type, categoryId, updatedAt, deletedAt, [workspaceId+dateKey], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt]",

        // categories now have iconKey/colorKey + isArchived
        categories:
          "&id, workspaceId, type, order, isArchived, updatedAt, deletedAt, [workspaceId+type], [workspaceId+isArchived], [workspaceId+updatedAt]",

        budgets: "&id, workspaceId, month, deletedAt",
        goals: "&id, workspaceId, targetAmount, currentAmount, deadline, deletedAt",
      })
      .upgrade(async (tx) => {
        // --- transactions: date -> dateKey, amount(minor) -> amountMinor, numeric timestamps -> ISO strings
        await tx.table("transactions").toCollection().modify((t: Partial<Transaction> & Record<string, unknown>) => {
          // dateKey
          if (!t.dateKey) {
            if (typeof t.date === "string") t.dateKey = t.date;
            else if (typeof t.date === "number") t.dateKey = new Date(t.date).toISOString().slice(0, 10);
          }

          // amountMinor
          // legacy `amount` was stored in minor units already
          if (typeof t.amountMinor !== "number") {
            if (typeof t.amount === "number") {
              t.amountMinor = Math.round(t.amount);
            } else if (typeof t.amountMinor === "string") {
              const n = Number(t.amountMinor);
              if (Number.isFinite(n)) t.amountMinor = Math.round(n);
            }
          }

          // createdAt / updatedAt
          if (typeof t.createdAt === "number") t.createdAt = new Date(t.createdAt).toISOString();
          if (typeof t.updatedAt === "number") t.updatedAt = new Date(t.updatedAt).toISOString();
          if (typeof t.deletedAt === "number") t.deletedAt = new Date(t.deletedAt).toISOString();

          // normalize empty strings
          if (t.categoryId === "") t.categoryId = null;
          if (t.note === "") t.note = null;
        });

        // --- categories: icon -> iconKey, color -> colorKey, add isArchived
        await tx.table("categories").toCollection().modify((c: Partial<Category> & Record<string, unknown>) => {
          if (!c.iconKey && typeof c.icon === "string") c.iconKey = c.icon as IconName;
          if (!c.colorKey && typeof c.color === "string") c.colorKey = c.color as CategoryColor;

          if (typeof c.isArchived !== "boolean") c.isArchived = false;

          if (typeof c.createdAt === "number") c.createdAt = new Date(c.createdAt).toISOString();
          if (typeof c.updatedAt === "number") c.updatedAt = new Date(c.updatedAt).toISOString();
          if (typeof c.deletedAt === "number") c.deletedAt = new Date(c.deletedAt).toISOString();
        });
      });
  }
}

export const db = new BudgetDB();

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
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
    await db.meta.put({ key, value: "6", updatedAt: nowIso() });
    return;
  }
  if (existing.value !== "6") {
    await db.meta.put({ key, value: "6", updatedAt: nowIso() });
  }
}
