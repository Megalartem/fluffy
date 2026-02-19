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
   * Fetch all expense transactions for a month and build a Map<categoryId, totalSpentMinor>.
   * Use this internally for bulk operations to avoid N+1 DB queries.
   */
  private async buildSpendingMap(
    workspaceId: string,
    month?: string
  ): Promise<{ map: Map<string, number>; totalMinor: number }> {
    const { from, to } = getMonthRange(month);
    const allExpenses = await this.transactionsRepo.list(workspaceId, {
      type: "expense",
      from,
      to,
    });

    const map = new Map<string, number>();
    let totalMinor = 0;
    for (const tx of allExpenses) {
      totalMinor += tx.amountMinor;
      if (tx.categoryId) {
        map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amountMinor);
      }
    }
    return { map, totalMinor };
  }

  /**
   * Calculate spent amount for a category in a given month.
   * For single-category look-ups (e.g. useCategoryBudgetSummary).
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
   * Get total budget summary for all categories.
   *
   * Fetches all expense transactions for the month in a single query, then
   * computes per-category spend in memory — eliminating N+1 DB round-trips.
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
    // Single DB round-trip for all expenses this month
    const { map: spendingMap, totalMinor: totalExpenseMinor } =
      await this.buildSpendingMap(workspaceId, month);

    const budgets = await this.budgetsService.list(workspaceId);

    // If no budgets, everything is unbudgeted
    if (budgets.length === 0) {
      return {
        totalLimitMinor: 0,
        totalSpentMinor: 0,
        unbudgetedMinor: totalExpenseMinor,
        categoryBudgets: [],
      };
    }

    // Resolve categories for all budgets in parallel
    const categoryEntries = await Promise.all(
      budgets.map((b) => this.categoriesRepo.getById(workspaceId, b.categoryId))
    );

    const categoryBudgets: CategoryBudgetSummary[] = [];
    let totalLimitMinor = 0;
    let totalSpentMinor = 0;

    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      const category = categoryEntries[i];
      if (!category) continue;

      const spentMinor = spendingMap.get(budget.categoryId) ?? 0;
      categoryBudgets.push({ budget, category, spentMinor });
      totalLimitMinor += budget.limitMinor;
      totalSpentMinor += spentMinor;
    }

    const unbudgetedMinor = Math.max(0, totalExpenseMinor - totalSpentMinor);

    return {
      totalLimitMinor,
      totalSpentMinor,
      unbudgetedMinor,
      categoryBudgets,
    };
  }

  /**
   * Get categories that have spending but no budget.
   * Useful for suggesting budget creation.
   *
   * Uses a single transaction fetch shared with the spending map for efficiency.
   */
  async getCategoriesWithoutBudget(
    workspaceId: string,
    month?: string
  ): Promise<Array<{ category: Category; spentMinor: number }>> {
    // Fetch all data in parallel
    const [allCategories, budgets, { map: spendingMap }] = await Promise.all([
      this.categoriesRepo.list(workspaceId),
      this.budgetsService.list(workspaceId),
      this.buildSpendingMap(workspaceId, month),
    ]);

    const expenseCategories = allCategories.filter((cat) => cat.type === "expense");
    const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));

    const result: Array<{ category: Category; spentMinor: number }> = [];

    for (const category of expenseCategories) {
      if (budgetedCategoryIds.has(category.id)) continue;
      const spentMinor = spendingMap.get(category.id) ?? 0;
      if (spentMinor > 0) {
        result.push({ category, spentMinor });
      }
    }

    // Sort by spending descending
    result.sort((a, b) => b.spentMinor - a.spentMinor);

    return result;
  }
}
