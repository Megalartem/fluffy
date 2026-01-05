import type { CreateTransactionInput, Transaction } from "../model/types";
import type { TransactionsRepo } from "../api/repo";
import type { SettingsRepo } from "../../settings/api/repo";
import { AppError } from "@/shared/errors/app-error";
import { nowIso, todayIsoDate } from "@/shared/lib/storage/db";
import type { UpdateTransactionInput } from "./types";
import { toDateKey } from "./helpers/date";

function makeId(prefix: string): string {
  // SSR-safe uuid generation
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${uuid}`;
}

export class TransactionService {
  constructor(
    private readonly transactionsRepo: TransactionsRepo,
    private readonly settingsRepo: SettingsRepo
  ) {}

  async addTransaction(workspaceId: string, input: CreateTransactionInput): Promise<Transaction> {
    if (!Number.isFinite(input.amountMinor) || input.amountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", { field: "amount" });
    }

    const settings = await this.settingsRepo.get(workspaceId);

    const tx: Transaction = {
      id: makeId("tx"),
      workspaceId,
      type: input.type,
      amountMinor: input.amountMinor,
      currency: input.currency || settings.defaultCurrency,
      dateKey: input.dateKey ?? todayIsoDate(),
      categoryId: input.categoryId ?? null,
      note: input.note ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    };

    return this.transactionsRepo.create(workspaceId, tx);
  }

  async updateTransaction(workspaceId: string, input: UpdateTransactionInput) {
    // Validate amount if provided
    if (input.patch.amountMinor !== undefined) {
      if (!Number.isFinite(input.patch.amountMinor) || input.patch.amountMinor <= 0) {
        throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", { field: "amount" });
      }
    }

    // If someone passes an empty date string
    if (input.patch.dateKey === "") {
      input.patch.dateKey = todayIsoDate();
    }

    if (input.patch.dateKey !== undefined) {
      input.patch.dateKey = toDateKey(input.patch.dateKey || todayIsoDate());
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
