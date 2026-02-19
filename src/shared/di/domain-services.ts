import { container } from "./container";
import { transactionsRepo } from "@/features/transactions/api/repo.dexie";
import { settingsRepo } from "@/features/settings/api/repo.dexie";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";
import { contributionsRepo, goalsRepo } from "@/features/goals/api/repo.dexie";
import { budgetsRepo } from "@/features/budgets/api/repo.dexie";
import { TransactionService } from "@/features/transactions/model/service";
import { CategoryService } from "@/features/categories/model/service";
import { GoalsService } from "@/features/goals/model/service";
import { GoalContributionsService } from "@/features/goals/model/contributions.service";
import { BudgetsService } from "@/features/budgets/model/service";
import { BudgetSummaryService } from "@/features/budgets/model/summary-service";

const KEYS = {
  transactionService: "service.transaction",
  categoryService: "service.category",
  goalsService: "service.goals",
  goalContributionsService: "service.goalContributions",
  budgetsService: "service.budgets",
  budgetSummaryService: "service.budgetSummary",
} as const;

let initialized = false;

function registerDomainServices() {
  if (initialized) return;

  container.register(KEYS.transactionService, () =>
    new TransactionService(transactionsRepo, settingsRepo)
  );

  container.register(KEYS.categoryService, () =>
    new CategoryService(new DexieCategoriesRepo(), transactionsRepo, budgetsRepo)
  );

  container.register(KEYS.goalsService, () =>
    new GoalsService(
      goalsRepo,
      contributionsRepo,
      settingsRepo,
      container.get<TransactionService>(KEYS.transactionService)
    )
  );

  container.register(KEYS.goalContributionsService, () =>
    new GoalContributionsService(
      contributionsRepo,
      goalsRepo,
      container.get<TransactionService>(KEYS.transactionService)
    )
  );

  container.register(KEYS.budgetsService, () =>
    new BudgetsService(
      budgetsRepo,
      new DexieCategoriesRepo(),
      settingsRepo
    )
  );

  container.register(KEYS.budgetSummaryService, () =>
    new BudgetSummaryService(
      container.get<BudgetsService>(KEYS.budgetsService),
      transactionsRepo,
      new DexieCategoriesRepo()
    )
  );

  initialized = true;
}

export function getTransactionService(): TransactionService {
  registerDomainServices();
  return container.get<TransactionService>(KEYS.transactionService);
}

export function getCategoryService(): CategoryService {
  registerDomainServices();
  return container.get<CategoryService>(KEYS.categoryService);
}

export function getGoalsService(): GoalsService {
  registerDomainServices();
  return container.get<GoalsService>(KEYS.goalsService);
}

export function getGoalContributionsService(): GoalContributionsService {
  registerDomainServices();
  return container.get<GoalContributionsService>(KEYS.goalContributionsService);
}

export function getBudgetsService(): BudgetsService {
  registerDomainServices();
  return container.get<BudgetsService>(KEYS.budgetsService);
}

export function getBudgetSummaryService(): BudgetSummaryService {
  registerDomainServices();
  return container.get<BudgetSummaryService>(KEYS.budgetSummaryService);
}
