import type { Transaction, TransactionType, CreateTransactionInput } from "@/features/transactions/model/types";

export type TransactionListQuery = {
  from?: string;
  to?: string;
  type?: TransactionType;
  categoryId?: string | null;
  limit?: number; // default 50
};

export interface TransactionsRepo {
  create(workspaceId: string, tx: Transaction): Promise<Transaction>;
  list(workspaceId: string, query?: TransactionListQuery): Promise<Transaction[]>;
}
