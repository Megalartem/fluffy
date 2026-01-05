export type TransactionType = "expense" | "income" | "transfer";

export type CurrencyCode = "USD" | "EUR" | "RUB" | "VND" | string;

export type Transaction = {
  id: string;
  workspaceId: string;

  type: TransactionType;
  amountMinor: number;
  currency: CurrencyCode;
  categoryId?: string | null;
  note?: string | null;

  dateKey: string; // YYYY-MM-DD

  createdAt: string; // ISO datetime
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateTransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type UpdateTransactionPatch = Partial<
  Pick<Transaction, "type" | "amountMinor" | "currency" | "categoryId" | "note" | "dateKey">
>;

export type UpdateTransactionInput = {
  id: string;
  patch: UpdateTransactionPatch;
};
