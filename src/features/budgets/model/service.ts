import type { BudgetsRepo } from "@/features/budgets/api/repo";
import { DexieBudgetsRepo } from "@/features/budgets/api/repo.dexie";
import type { BudgetStatus, MonthlyBudget } from "./types";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class BudgetService {
  constructor(
    private budgetsRepo: BudgetsRepo = new DexieBudgetsRepo(),
    private txRepo = new DexieTransactionsRepo(),
    private settingsRepo = new DexieSettingsRepo()
  ) {}

  async setMonthlyLimit(workspaceId: string, month: string, limit: number): Promise<MonthlyBudget> {
    if (!Number.isFinite(limit) || limit <= 0) {
      throw new AppError("VALIDATION_ERROR", "Limit must be greater than 0", { field: "limit" });
    }

    const settings = await this.settingsRepo.get(workspaceId);
    const existing = await this.budgetsRepo.getByMonth(workspaceId, month);

    const now = nowIso();
    const budget: MonthlyBudget = existing
      ? { ...existing, limit, updatedAt: now }
      : {
          id: makeId("budget"),
          workspaceId,
          month,
          currency: settings.defaultCurrency,
          limit,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        };

    return this.budgetsRepo.upsert(workspaceId, budget);
  }

  async getBudgetStatus(workspaceId: string, month: string): Promise<BudgetStatus> {
    const budget = await this.budgetsRepo.getByMonth(workspaceId, month);
    const settings = await this.settingsRepo.get(workspaceId);

    const txs = await this.txRepo.list(workspaceId);
    const spent = txs
      .filter((t) => t.type === "expense" && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);

    if (!budget) {
      return {
        month,
        currency: settings.defaultCurrency,
        limit: null,
        spent,
        progress: 0,
        threshold: "none",
      };
    }

    const progress = budget.limit > 0 ? Math.min(1, spent / budget.limit) : 0;
    const threshold =
      progress >= 1 ? "limit100" : progress >= 0.8 ? "warn80" : "none";

    return {
      month,
      currency: budget.currency,
      limit: budget.limit,
      spent,
      progress,
      threshold,
    };
  }
}
