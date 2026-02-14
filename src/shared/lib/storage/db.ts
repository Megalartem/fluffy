import Dexie, { Table } from "dexie";
import type { AppSettings } from "@/features/settings/model/types";
import type { Transaction } from "@/features/transactions/model/types";
import type { Category, CategoryColor } from "@/features/categories/model/types";
import type { MonthlyBudget } from "@/features/budgets/model/types";
import type { Goal, GoalContribution } from "@/features/goals/model/types";
import { IconName } from "lucide-react/dynamic";


const DB_SCHEMA_VERSION = 8;




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

  goalContributions!: Table<GoalContribution, string>;



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
    // v7: goals -> align with amountMinor fields + add goalContributions table
    this.version(7)
      .stores({
        meta: "&key",
        settings: "&id, workspaceId",

        transactions:
          "&id, workspaceId, dateKey, type, categoryId, updatedAt, deletedAt, [workspaceId+dateKey], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt]",

        categories:
          "&id, workspaceId, type, order, isArchived, updatedAt, deletedAt, [workspaceId+type], [workspaceId+isArchived], [workspaceId+updatedAt]",

        budgets: "&id, workspaceId, month, deletedAt",

        // goals now use *Minor fields + status
        goals:
          "&id, workspaceId, status, deadline, updatedAt, deletedAt, [workspaceId+status], [workspaceId+updatedAt]",

        // goalContributions is the source of truth for reserved
        goalContributions:
          "&id, workspaceId, goalId, dateKey, linkedTransactionId, updatedAt, deletedAt, [workspaceId+goalId], [workspaceId+dateKey], [workspaceId+updatedAt]",
      })
      .upgrade(async (tx) => {
        // Build workspaceId -> defaultCurrency map from settings (best-effort)
        const currencyByWs = new Map<string, string>();
        try {
          const settingsArr = await tx.table("settings").toArray();
          for (const s of settingsArr as Array<Partial<AppSettings> & Record<string, unknown>>) {
            if (typeof s.workspaceId === "string") {
              const cur = s.defaultCurrency;
              if (typeof cur === "string" && cur.trim()) currencyByWs.set(s.workspaceId, cur);
            }
          }
        } catch {
          // ignore
        }

        // --- goals: targetAmount/currentAmount -> *Minor, title -> name, add currency/status
        await tx.table("goals").toCollection().modify((g: Partial<Goal> & Record<string, unknown>) => {
          // name
          if (!g.name && typeof g.title === "string") g.name = g.title as string;

          // targetAmountMinor
          if (typeof g.targetAmountMinor !== "number") {
            const legacy = g.targetAmount;
            if (typeof legacy === "number") g.targetAmountMinor = Math.round(legacy);
            else if (typeof legacy === "string") {
              const n = Number(legacy);
              if (Number.isFinite(n)) g.targetAmountMinor = Math.round(n);
            }
          }

          // currentAmountMinor
          if (typeof g.currentAmountMinor !== "number") {
            const legacy = g.currentAmount;
            if (typeof legacy === "number") g.currentAmountMinor = Math.round(legacy);
            else if (typeof legacy === "string") {
              const n = Number(legacy);
              if (Number.isFinite(n)) g.currentAmountMinor = Math.round(n);
            } else {
              g.currentAmountMinor = 0;
            }
          }

          // currency
          if (typeof g.currency !== "string" || !g.currency) {
            const ws = typeof g.workspaceId === "string" ? g.workspaceId : "";
            g.currency = currencyByWs.get(ws) ?? "RUB";
          }

          // status
          if (g.status !== "active" && g.status !== "completed" && g.status !== "archived") {
            g.status = "active";
          }

          // timestamps normalization
          if (typeof g.createdAt === "number") g.createdAt = new Date(g.createdAt as number).toISOString();
          if (typeof g.updatedAt === "number") g.updatedAt = new Date(g.updatedAt as number).toISOString();
          if (typeof g.deletedAt === "number") g.deletedAt = new Date(g.deletedAt as number).toISOString();

          // normalize empty strings
          if (g.deadline === "") g.deadline = null;
        });
      });

    // v8: force upgrade to heal schema drift (older v7 builds may have created BudgetDB without some stores)
    // Keeps the v7 schema as-is, but bumps verno so IndexedDB runs onupgradeneeded and creates any missing object stores.
    this.version(8)
      .stores({
        meta: "&key",
        settings: "&id, workspaceId",

        transactions:
          "&id, workspaceId, dateKey, type, categoryId, updatedAt, deletedAt, [workspaceId+dateKey], [workspaceId+type], [workspaceId+categoryId], [workspaceId+updatedAt]",

        categories:
          "&id, workspaceId, type, order, isArchived, updatedAt, deletedAt, [workspaceId+type], [workspaceId+isArchived], [workspaceId+updatedAt]",

        budgets: "&id, workspaceId, month, deletedAt",

        goals:
          "&id, workspaceId, status, deadline, updatedAt, deletedAt, [workspaceId+status], [workspaceId+updatedAt]",

        goalContributions:
          "&id, workspaceId, goalId, dateKey, linkedTransactionId, updatedAt, deletedAt, [workspaceId+goalId], [workspaceId+dateKey], [workspaceId+updatedAt]",
      })
      .upgrade(async (tx) => {
        // Repeat the v7 goal normalization as a best-effort safety net.
        await tx.table("goals").toCollection().modify((g: Partial<Goal> & Record<string, unknown>) => {
          if (!g.name && typeof g.title === "string") g.name = g.title as string;

          if (typeof g.targetAmountMinor !== "number") {
            const legacy = g.targetAmount;
            if (typeof legacy === "number") g.targetAmountMinor = Math.round(legacy);
            else if (typeof legacy === "string") {
              const n = Number(legacy);
              if (Number.isFinite(n)) g.targetAmountMinor = Math.round(n);
            }
          }

          if (typeof g.currentAmountMinor !== "number") {
            const legacy = g.currentAmount;
            if (typeof legacy === "number") g.currentAmountMinor = Math.round(legacy);
            else if (typeof legacy === "string") {
              const n = Number(legacy);
              if (Number.isFinite(n)) g.currentAmountMinor = Math.round(n);
            } else {
              g.currentAmountMinor = 0;
            }
          }

          if (g.status !== "active" && g.status !== "completed" && g.status !== "archived") {
            g.status = "active";
          }

          if (typeof g.createdAt === "number") g.createdAt = new Date(g.createdAt as number).toISOString();
          if (typeof g.updatedAt === "number") g.updatedAt = new Date(g.updatedAt as number).toISOString();
          if (typeof g.deletedAt === "number") g.deletedAt = new Date(g.deletedAt as number).toISOString();

          if (g.deadline === "") g.deadline = null;
        });
      });
  }
}

export const db = new BudgetDB();

let ensuredSchemaVersion: string | null = null;
let ensureInFlight: Promise<void> | null = null;

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
  const target = String(DB_SCHEMA_VERSION);
  if (ensuredSchemaVersion === target) return;
  if (ensureInFlight) return ensureInFlight;

  // Important: this may be called from inside a Dexie transaction that doesn't include `meta`.
  // If we don't ignore the ambient transaction, IndexedDB will throw NotFoundError
  // when trying to access an objectStore that wasn't included in the transaction scope.
  ensureInFlight = Dexie.ignoreTransaction(async () => {
    const key = "schemaVersion";
    const existing = await db.meta.get(key);
    if (!existing) {
      await db.meta.put({ key, value: target, updatedAt: nowIso() });
      ensuredSchemaVersion = target;
      return;
    }
    if (existing.value !== target) {
      await db.meta.put({ key, value: target, updatedAt: nowIso() });
    }
    ensuredSchemaVersion = target;
  });

  try {
    await ensureInFlight;
  } finally {
    ensureInFlight = null;
  }
}
