import { Category } from "@/features/categories/model/types";
import { CurrencyCode } from "@/shared/di/types";

export type BudgetPeriod = "monthly";

export interface Budget {
  id: string;
  workspaceId: string;
  
  categoryId: string;
  period: BudgetPeriod;
  currency: CurrencyCode;
  limitMinor: number;
  
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CreateBudgetInput = Omit<Budget, "id" | "workspaceId" | "createdAt" | "updatedAt" | "deletedAt"> & {
  currency?: CurrencyCode; // Optional - will use workspace default if not provided
};
export type UpdateBudgetPatch = Partial<Pick<Budget, "limitMinor" | "period">>;
export type UpdateBudgetInput = { id: string; patch: UpdateBudgetPatch };

// Summary types
export interface CategoryBudgetSummary {
  budget: Budget;
  category: Category;
  spentMinor: number;
  remainingMinor: number;
  progress: number; // 0-1
  isOverBudget: boolean;
  isWarning: boolean; // >= 80%
}

export interface TotalBudgetSummary {
  totalLimitMinor: number;
  totalSpentMinor: number;
  totalRemainingMinor: number;
  unbudgetedMinor: number;
  progress: number;
  isOverBudget: boolean;
  categoryBudgets: CategoryBudgetSummary[];
}