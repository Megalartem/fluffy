/**
 * Ограничения и лимиты для валидации данных
 */

export const LIMITS = {
  /** Максимальная сумма транзакции */
  MAX_TRANSACTION_AMOUNT: 999_999_999 as const,

  /** Минимальная сумма транзакции */
  MIN_TRANSACTION_AMOUNT: 1 as const,

  /** Максимальная длина названия категории */
  MAX_CATEGORY_NAME_LENGTH: 50 as const,

  /** Минимальная длина названия категории */
  MIN_CATEGORY_NAME_LENGTH: 1 as const,

  /** Максимальная сумма цели */
  MAX_GOAL_AMOUNT: 999_999_999 as const,

  /** Минимальная сумма цели */
  MIN_GOAL_AMOUNT: 1 as const,

  /** Максимальная длина названия цели */
  MAX_GOAL_NAME_LENGTH: 100 as const,

  /** Максимальная длина заметки */
  MAX_NOTE_LENGTH: 500 as const,
} as const;
