/**
 * Значения по умолчанию для приложения
 */

export const DEFAULTS = {
  /** Валюта по умолчанию */
  CURRENCY: "VND" as const,

  /** Локаль по умолчанию */
  LOCALE: "ru-RU" as const,

  /** Тип транзакции по умолчанию */
  TRANSACTION_TYPE: "expense" as const,

  /** Локальный ID workspace */
  LOCAL_WORKSPACE_ID: "ws_local" as const,

  /** Количество транзакций загружаемых по умолчанию */
  TRANSACTION_LIST_LIMIT: 50 as const,

  /** Количество недавних транзакций для быстрого доступа */
  RECENT_TRANSACTION_LIMIT: 5 as const,
} as const;

export const BUDGET_THRESHOLDS = {
  /** Порог предупреждения (80%) */
  WARN: 80 as const,

  /** Порог критического (100%) */
  LIMIT: 100 as const,
} as const;
