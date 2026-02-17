import type { CategoryBudgetSummary, TotalBudgetSummary } from "./types";
import type { BudgetsService } from "./service";
import type { TransactionsRepo } from "@/features/transactions/api/repo";
import type { ICategoriesRepository } from "@/core/repositories";
import type { Category } from "@/features/categories/model/types";

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Parse month string to get start and end date keys
 * @param month - YYYY-MM format, defaults to current month
 */
function getMonthRange(month?: string): { from: string; to: string } {
  const targetMonth = month || getCurrentMonth();
  const [year, monthNum] = targetMonth.split("-");
  
  // First day of month
  const from = `${year}-${monthNum}-01`;
  
  // Last day of month
  const lastDay = new Date(Number(year), Number(monthNum), 0).getDate();
  const to = `${year}-${monthNum}-${String(lastDay).padStart(2, "0")}`;
  
  return { from, to };
}

/**
 * Service for calculating budget summaries and aggregations
 */
export class BudgetSummaryService {
  constructor(
    private readonly budgetsService: BudgetsService,
    private readonly transactionsRepo: TransactionsRepo,
    private readonly categoriesRepo: ICategoriesRepository
  ) {}

  /**
   * Calculate spent amount for a category in a given month
   * 
   * Formula: sum(transaction.amountMinor) where:
   * - transaction.type = "expense"
   * - transaction.dateKey ∈ month
   * - transaction.categoryId = categoryId
   * - transaction.deletedAt is null
   */
  async getCategorySpent(
    workspaceId: string,
    categoryId: string,
    month?: string
  ): Promise<number> {
    const { from, to } = getMonthRange(month);

    const transactions = await this.transactionsRepo.list(workspaceId, {
      type: "expense",
      categoryId,
      from,
      to,
    });

    return transactions.reduce((sum, tx) => sum + tx.amountMinor, 0);
  }

  /**
   * Get budget summary for a single category
   */
  async getCategoryBudgetSummary(
    workspaceId: string,
    categoryId: string,
    month?: string
  ): Promise<CategoryBudgetSummary | null> {
    const budget = await this.budgetsService.getByCategoryId(workspaceId, categoryId);
    if (!budget) return null;

    const category = await this.categoriesRepo.getById(workspaceId, categoryId);
    if (!category) return null;

    const spentMinor = await this.getCategorySpent(workspaceId, categoryId, month);

    return {
      budget,
      category,
      spentMinor,
    };
  }

  /**
   * Get total budget summary for all categories
   * 
   * Includes:
   * - Total limit (sum of all budget limits)
   * - Total spent (sum of spent in budgeted categories)
   * - Unbudgeted spend (expense transactions not covered by any budget)
   * - Overall progress
   * - Per-category summaries
   */
  async getTotalBudgetSummary(
    workspaceId: string,
    month?: string
  ): Promise<TotalBudgetSummary> {
    const budgets = await this.budgetsService.list(workspaceId);
    
    // If no budgets, return empty state
    if (budgets.length === 0) {
      const { from, to } = getMonthRange(month);
      const allExpenses = await this.transactionsRepo.list(workspaceId, {
        type: "expense",
        from,
        to,
      });
      const totalExpenseMinor = allExpenses.reduce((sum, tx) => sum + tx.amountMinor, 0);

      return {
        totalLimitMinor: 0,
        totalSpentMinor: 0,
        unbudgetedMinor: totalExpenseMinor,
        categoryBudgets: [],
      };
    }

    // Calculate per-category summaries
    const categoryBudgets: CategoryBudgetSummary[] = [];
    let totalLimitMinor = 0;
    let totalSpentMinor = 0;

    for (const budget of budgets) {
      const summary = await this.getCategoryBudgetSummary(
        workspaceId,
        budget.categoryId,
        month
      );
      
      if (summary) {
        categoryBudgets.push(summary);
        totalLimitMinor += budget.limitMinor;
        totalSpentMinor += summary.spentMinor;
      }
    }

    // Calculate unbudgeted spending
    const { from, to } = getMonthRange(month);
    const allExpenses = await this.transactionsRepo.list(workspaceId, {
      type: "expense",
      from,
      to,
    });

    const totalExpenseMinor = allExpenses.reduce((sum, tx) => sum + tx.amountMinor, 0);
    const unbudgetedMinor = Math.max(0, totalExpenseMinor - totalSpentMinor);

    return {
      totalLimitMinor,
      totalSpentMinor,
      unbudgetedMinor,
      categoryBudgets,
    };
  }

  /**
   * Get categories that have spending but no budget
   * Useful for suggesting budget creation
   */
  async getCategoriesWithoutBudget(
    workspaceId: string,
    month?: string
  ): Promise<Array<{ category: Category; spentMinor: number }>> {
    // Get all expense categories
    const allCategories = await this.categoriesRepo.list(workspaceId);
    const expenseCategories = allCategories.filter(cat => cat.type === "expense");

    // Get all budgets
    const budgets = await this.budgetsService.list(workspaceId);
    const budgetedCategoryIds = new Set(budgets.map(b => b.categoryId));

    // Find categories without budgets that have spending
    const result: Array<{ category: Category; spentMinor: number }> = [];

    for (const category of expenseCategories) {
      if (budgetedCategoryIds.has(category.id)) continue;

      const spentMinor = await this.getCategorySpent(workspaceId, category.id, month);
      
      if (spentMinor > 0) {
        result.push({ category, spentMinor });
      }
    }

    // Sort by spending descending
    result.sort((a, b) => b.spentMinor - a.spentMinor);

    return result;
  }
}
