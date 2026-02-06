import { CurrencyCode } from "@/shared/di/types";

export type TransactionType = "expense" | "income" | "transfer";


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

export type TransactionsSortValue =
  | { key: null; direction: null }
  | { key: "date"; direction: "asc" | "desc" }
  | { key: "amount"; direction: "asc" | "desc" }
  | { key: "type"; direction: "asc" | "desc" };

export type TransactionsFilterValues = {
  query: string;
  type: "all" | TransactionType;
  categoryIds: string[];
  sort: TransactionsSortValue;
};