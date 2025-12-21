import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";
import type { BudgetsRepo } from "./repo";
import type { MonthlyBudget } from "../model/types";

export class DexieBudgetsRepo implements BudgetsRepo {
  async getByMonth(workspaceId: string, month: string): Promise<MonthlyBudget | null> {
    try {
      await ensureDbInitialized();
      const arr = await db.budgets
        .where("workspaceId")
        .equals(workspaceId)
        .filter((b) => !b.deletedAt && b.month === month)
        .toArray();
      return arr[0] ?? null;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to read budget", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async upsert(workspaceId: string, budget: MonthlyBudget): Promise<MonthlyBudget> {
    try {
      await ensureDbInitialized();
      await db.budgets.put(budget);
      return budget;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to upsert budget", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async softDelete(workspaceId: string, month: string): Promise<void> {
    try {
      await ensureDbInitialized();
      const existing = await this.getByMonth(workspaceId, month);
      if (!existing) return;
      await db.budgets.put({
        ...existing,
        deletedAt: nowIso(),
        updatedAt: nowIso(),
      });
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to delete budget", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
