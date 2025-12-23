import type { CreateTransactionInput, Transaction, TransactionType } from "../model/types";
import type { TransactionsRepo } from "../api/repo";
import type { SettingsRepo } from "../../settings/api/repo";
import { AppError } from "@/shared/errors/app-error";
import { nowIso, todayIsoDate } from "@/shared/lib/storage/db";
import type { UpdateTransactionInput } from "./types";

function makeId(prefix: string): string {
  // достаточно для local-first MVP
  return `${prefix}_${crypto.randomUUID()}`;
}

export class TransactionService {
  constructor(
    private readonly transactionsRepo: TransactionsRepo,
    private readonly settingsRepo: SettingsRepo
  ) {}

  async addTransaction(workspaceId: string, input: CreateTransactionInput): Promise<Transaction> {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", { field: "amount" });
    }

    const settings = await this.settingsRepo.get(workspaceId);

    const tx: Transaction = {
      id: makeId("tx"),
      workspaceId,
      type: input.type,
      amount: input.amount,
      currency: settings.defaultCurrency,
      date: input.date ?? todayIsoDate(),
      categoryId: input.categoryId ?? null,
      note: input.note ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    };

    return this.transactionsRepo.create(workspaceId, tx);
  }

  async updateTransaction(workspaceId: string, id: string, p0: { type: TransactionType; amount: number; note: string | null; categoryId: string | null; }, input: UpdateTransactionInput) {
  if (input.patch.amount !== undefined) {
    if (!Number.isFinite(input.patch.amount) || input.patch.amount <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", { field: "amount" });
    }
  }

  // если кто-то передаст пустую дату
  if (input.patch.date === "") {
    input.patch.date = todayIsoDate();
  }

  return this.transactionsRepo.update(workspaceId, input.id, {
    ...input.patch,
    updatedAt: nowIso(),
  });
  }

  async deleteTransaction(workspaceId: string, id: string) {
    return this.transactionsRepo.softDelete(workspaceId, id);
  }
}
