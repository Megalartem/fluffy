import type { CategoryBudgetSummary, TotalBudgetSummary } from "./types";

/**
 * Calculate remaining amount for a budget
 * @returns Positive if under budget, negative if over budget
 */
export function getBudgetRemaining(summary: CategoryBudgetSummary): number {
  return summary.budget.limitMinor - summary.spentMinor;
}

/**
 * Calculate budget progress as a fraction (0-1+)
 * Returns > 1 if over budget
 */
export function getBudgetProgress(summary: CategoryBudgetSummary): number {
  if (summary.budget.limitMinor === 0) return 0;
  return summary.spentMinor / summary.budget.limitMinor;
}

/**
 * Check if budget is over the limit
 */
export function isBudgetOverLimit(summary: CategoryBudgetSummary): boolean {
  return summary.spentMinor > summary.budget.limitMinor;
}

/**
 * Check if budget is in warning zone (>= 80% spent)
 */
export function isBudgetWarning(summary: CategoryBudgetSummary): boolean {
  const progress = getBudgetProgress(summary);
  return progress >= 0.75 && !isBudgetOverLimit(summary);
}

/**
 * Calculate total remaining amount for all budgets
 */
export function getTotalBudgetRemaining(summary: TotalBudgetSummary): number {
  return summary.totalLimitMinor - summary.totalSpentMinor;
}

/**
 * Calculate total budget progress as a fraction (0-1+)
 */
export function getTotalBudgetProgress(summary: TotalBudgetSummary): number {
  if (summary.totalLimitMinor === 0) return 0;
  return summary.totalSpentMinor / summary.totalLimitMinor;
}

/**
 * Check if total budget is over the limit
 */
export function isTotalBudgetOverLimit(summary: TotalBudgetSummary): boolean {
  return summary.totalSpentMinor > summary.totalLimitMinor;
}
