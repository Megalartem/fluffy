/**
 * Типы и значения для транзакций
 */

export const TRANSACTION_TYPES = ["expense", "income"] as const;

export type TransactionTypeValue = typeof TRANSACTION_TYPES[number];

export const TRANSACTION_LABELS: Record<TransactionTypeValue, string> = {
  expense: "Расход",
  income: "Доход",
} as const;
