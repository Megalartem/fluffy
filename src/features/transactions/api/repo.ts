import type { Transaction, TransactionType } from "../model/types";

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

export interface TransactionsRepo {
  create(workspaceId: string, tx: Transaction): Promise<Transaction>;
  list(workspaceId: string, query?: TransactionListQuery): Promise<Transaction[]>;
  listRecent(workspaceId: string, params?: { type?: "expense" | "income"; limit?: number }): Promise<Transaction[]>;

  update(workspaceId: string, id: string, patch: Partial<Transaction>): Promise<Transaction>;
  softDelete(workspaceId: string, id: string): Promise<void>;

  getById(workspaceId: string, id: string): Promise<Transaction | null>;

  countByCategory(workspaceId: string, categoryId: string): Promise<number>;
  unsetCategory(workspaceId: string, categoryId: string): Promise<void>;
}