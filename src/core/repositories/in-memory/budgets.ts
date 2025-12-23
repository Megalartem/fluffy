import type { IBudgetsRepository } from "@/core/repositories";
import type { MonthlyBudget } from "@/features/budgets/model/types";
import { AppError } from "@/shared/errors/app-error";

/**
 * In-Memory implementation of IBudgetsRepository for testing.
 */
export class InMemoryBudgetsRepository implements IBudgetsRepository {
  private storage = new Map<string, MonthlyBudget>();

  async getByMonth(workspaceId: string, month: string): Promise<MonthlyBudget | null> {
    const budgets = Array.from(this.storage.values()).filter(
      (b) => b.workspaceId === workspaceId && !b.deletedAt && b.month === month
    );
    return budgets[0] ?? null;
  }

  async list(workspaceId: string): Promise<MonthlyBudget[]> {
    return Array.from(this.storage.values()).filter(
      (b) => b.workspaceId === workspaceId && !b.deletedAt
    );
  }

  async set(workspaceId: string, budget: MonthlyBudget): Promise<MonthlyBudget> {
    const id = `budget_${workspaceId}_${budget.month}`;
    this.storage.set(id, { ...budget, workspaceId });
    return this.storage.get(id)!;
  }

  async softDelete(workspaceId: string, month: string): Promise<void> {
    const existing = await this.getByMonth(workspaceId, month);
    if (!existing) return;

    const id = `budget_${workspaceId}_${month}`;
    this.storage.set(id, {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Test utilities
  clear(): void {
    this.storage.clear();
  }

  getAll(): MonthlyBudget[] {
    return Array.from(this.storage.values());
  }
}
