/**
 * Meta-ключи для IndexedDB meta таблицы
 * 
 * Все ключи, которые хранятся в meta.db, определены здесь
 * для избежания magic strings и централизованного управления
 */

export const META_KEYS = {
  /**
   * Последние значения по умолчанию при создании транзакции
   * Хранит: { type: "expense" | "income", categoryId: string | null }
   * Пример: `last_transaction_defaults`
   */
  LAST_TRANSACTION_DEFAULTS: "last_transaction_defaults",

  /**
   * Флаг, что категории уже были засеяны для workspace
   * Хранит: "1" (флаг наличия)
   * Пример: `seed_categories_ws_local`
   */
  SEED_CATEGORIES: (workspaceId: string) => `seed_categories_${workspaceId}`,

  /**
   * Последний уровень уведомления о бюджете за месяц
   * Хранит: "warn80" | "limit100" | "none"
   * Пример: `budget_notified_ws_local_2025-12`
   */
  BUDGET_NOTIFIED: (workspaceId: string, month: string) =>
    `budget_notified_${workspaceId}_${month}`,

  /**
   * Флаг, что пользователь видел уведомление о достижении цели
   * Хранит: "reached"
   * Пример: `goal_notified_ws_local_goal_123`
   */
  GOAL_NOTIFIED: (workspaceId: string, goalId: string) =>
    `goal_notified_${workspaceId}_${goalId}`,

  /**
   * Версия схемы базы данных
   * Хранит: "3" (текущая версия)
   */
  SCHEMA_VERSION: "schemaVersion",
} as const;

/**
 * Функции-помощники для работы с meta-ключами
 */
export const metaKeyHelpers = {
  /**
   * Возвращает ключ для seed категорий
   */
  seedCategoriesKey: (workspaceId: string) => META_KEYS.SEED_CATEGORIES(workspaceId),

  /**
   * Возвращает ключ для бюджетного уведомления
   */
  budgetNotifiedKey: (workspaceId: string, month: string) =>
    META_KEYS.BUDGET_NOTIFIED(workspaceId, month),

  /**
   * Возвращает ключ для уведомления о цели
   */
  goalNotifiedKey: (workspaceId: string, goalId: string) =>
    META_KEYS.GOAL_NOTIFIED(workspaceId, goalId),
};
