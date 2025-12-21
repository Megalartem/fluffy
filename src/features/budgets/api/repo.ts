import type { MonthlyBudget } from "../model/types";

export interface BudgetsRepo {
  getByMonth(workspaceId: string, month: string): Promise<MonthlyBudget | null>;
  upsert(workspaceId: string, budget: MonthlyBudget): Promise<MonthlyBudget>;
  softDelete(workspaceId: string, month: string): Promise<void>;
}
