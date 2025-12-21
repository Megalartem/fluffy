export type MonthlyBudget = {
  id: string;
  workspaceId: string;
  month: string; // YYYY-MM
  currency: string;
  limit: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type BudgetThreshold = "none" | "warn80" | "limit100";

export type BudgetStatus = {
  month: string;
  currency: string;
  limit: number | null;        // null if not set
  spent: number;               // expenses in that month
  progress: number;            // 0..1 (spent/limit)
  threshold: BudgetThreshold;  // none/warn80/limit100
};
