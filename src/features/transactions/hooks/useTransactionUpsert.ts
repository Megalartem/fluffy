import type { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionType, CurrencyCode } from "@/features/transactions/model/types";
import { toMinorByCurrency } from "@/shared/lib/money/helper";
import { AppError } from "@/shared/errors/app-error";

type Params = {
  workspaceId: string;
  type: TransactionType;
  currency: CurrencyCode;
  service: {
    addTransaction: (workspaceId: string, input: CreateTransactionInput) => Promise<Transaction>;
    updateTransaction: (workspaceId: string, input: UpdateTransactionInput) => Promise<unknown>;
  };
};

export function useTransactionUpsert({ workspaceId, type, currency, service }: Params) {
  async function createFromForm(payload: {
    amountRaw: string;
    dateKey: string;
    categoryId: string | null;
  }) {
    const amountMinor = toMinorByCurrency(payload.amountRaw, currency);
    if (amountMinor == null || amountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", { field: "amount" });
    }

    const input: CreateTransactionInput = {
      workspaceId,          // да, дублируем из-за текущего типа
      type,
      amountMinor,
      currency,
      categoryId: type === "transfer" ? null : payload.categoryId,
      note: null,
      dateKey: payload.dateKey,
    };

    return service.addTransaction(workspaceId, input);
  }

  async function updateFromForm(payload: {
    id: string;
    amountRaw: string;
    dateKey: string;
    categoryId: string | null;
  }) {
    const amountMinor = toMinorByCurrency(payload.amountRaw, currency);
    if (amountMinor == null || amountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", { field: "amount" });
    }

    const input: UpdateTransactionInput = {
      id: payload.id,
      patch: {
        amountMinor,
        dateKey: payload.dateKey,
        categoryId: type === "transfer" ? null : payload.categoryId,
      },
    };

    return service.updateTransaction(workspaceId, input);
  }

  return { createFromForm, updateFromForm };
}