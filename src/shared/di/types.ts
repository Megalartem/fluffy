/**
 * Типы для Dependency Injection системы
 */

/**
 * Функция-фабрика для создания сервиса
 */
export type ServiceFactory<T> = () => T;

/**
 * Конфигурация регистрации сервиса
 */
export interface ServiceRegistration<T> {
  key: string;
  factory: ServiceFactory<T>;
  singleton?: boolean;
}

/**
 * Ключи всех зарегистрированных сервисов
 * Используется для type-safe получения сервисов из контейнера
 */
export enum DI_KEYS {
  // Repos
  TRANSACTIONS_REPO = "TransactionsRepo",
  CATEGORIES_REPO = "CategoriesRepo",
  BUDGETS_REPO = "BudgetsRepo",
  GOALS_REPO = "GoalsRepo",
  SETTINGS_REPO = "SettingsRepo",

  // Services
  TRANSACTION_SERVICE = "TransactionService",
  CATEGORIES_SERVICE = "CategoriesService",
  BUDGETS_SERVICE = "BudgetsService",
  BUDGET_SUMMARY_SERVICE = "BudgetSummaryService",
  GOALS_SERVICE = "GoalsService",
  NOTIFICATIONS_SERVICE = "NotificationsService",
  DASHBOARD_SERVICE = "DashboardService",
  BACKUP_SERVICE = "BackupService",
  SETTINGS_SERVICE = "SettingsService",
}

export type CurrencyCode = "USD" | "EUR" | "RUB" | "VND" | string;
