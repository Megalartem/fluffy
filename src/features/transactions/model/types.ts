export type TransactionType = "expense" | "income";

export type Transaction = {
  id: string;
  workspaceId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string; // ISO date (YYYY-MM-DD)
  categoryId?: string | null;
  note?: string | null;
  createdAt: string; // ISO datetime
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  date?: string; // default today
  categoryId?: string | null;
  note?: string | null;
};

export type UpdateTransactionPatch = Partial<
  Pick<Transaction, "type" | "amount" | "date" | "categoryId" | "note">
>;

export type UpdateTransactionInput = {
  id: string;
  patch: UpdateTransactionPatch;
};
