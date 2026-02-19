import { createDomainLogger } from "@/shared/logging/logger";
import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import { makeId } from "@/shared/lib/id";
import type { Transaction } from "./types";
import { categoriesRepo } from "@/features/categories/api/repo.dexie";

const logger = createDomainLogger("transactions:seed");

const seedKey = (workspaceId: string) => `seed_transactions_${workspaceId}`;

/**
 * Seeds sample transactions using real categories from the workspace.
 * Only runs once per workspace.
 */
export async function ensureSampleTransactionsSeeded(workspaceId: string): Promise<void> {
  await ensureDbInitialized();

  const already = await db.meta.get(seedKey(workspaceId));
  if (already) return;

  // Get real categories to reference
  const categories = await categoriesRepo.list(workspaceId);
  if (categories.length === 0) {
    logger.warn("no categories found, skipping transaction seed", { workspaceId });
    return;
  }

  // Pick some categories for sample transactions
  const expenseCategory = categories.find(c => c.type === "expense" && !c.isArchived);
  const incomeCategory = categories.find(c => c.type === "income" && !c.isArchived);

  if (!expenseCategory) {
    logger.warn("no expense category found, skipping transaction seed", { workspaceId });
    return;
  }

  const now = nowIso();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const formatDateKey = (d: Date) => d.toISOString().slice(0, 10);

  const sampleTransactions: Transaction[] = [
    // Today
    {
      id: makeId("tx"),
      workspaceId,
      type: "expense",
      amountMinor: 4500, // $45.00
      currency: "USD",
      dateKey: formatDateKey(today),
      categoryId: expenseCategory.id,
      note: "Grocery shopping",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: makeId("tx"),
      workspaceId,
      type: "expense",
      amountMinor: 850, // $8.50
      currency: "USD",
      dateKey: formatDateKey(today),
      categoryId: expenseCategory.id,
      note: "Coffee",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    // Yesterday
    {
      id: makeId("tx"),
      workspaceId,
      type: "expense",
      amountMinor: 12000, // $120.00
      currency: "USD",
      dateKey: formatDateKey(yesterday),
      categoryId: expenseCategory.id,
      note: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  // Add income transaction if we have income category
  if (incomeCategory) {
    sampleTransactions.push({
      id: makeId("tx"),
      workspaceId,
      type: "income",
      amountMinor: 500000, // $5000.00
      currency: "USD",
      dateKey: formatDateKey(weekAgo),
      categoryId: incomeCategory.id,
      note: "Monthly salary",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  await db.transaction("rw", db.transactions, db.meta, async () => {
    await db.transactions.bulkPut(sampleTransactions);
    await db.meta.put({ key: seedKey(workspaceId), value: "1", updatedAt: nowIso() });
  });
}
