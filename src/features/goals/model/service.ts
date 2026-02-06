import { db, ensureDbInitialized } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";

import type { GoalsRepo, GoalContributionsRepo } from "@/features/goals/api/repo";
import type {
  CreateGoalInput,
  CreateGoalContributionInput,
  Goal,
  UpdateGoalPatch,
} from "./types";

import type { CreateTransactionInput } from "@/features/transactions/model/types";
import type { TransactionService } from "@/features/transactions/model/service";

import { transactionService } from "@/features/transactions/model/service";
import { settingsRepo } from "@/features/settings/api/repo.dexie";
import type { SettingsRepo } from "@/features/settings/api/repo";
import { contributionsRepo, goalsRepo } from "../api/repo.dexie";

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export class GoalsService {
  constructor(
    private readonly goalsRepo: GoalsRepo,
    private readonly contributionsRepo: GoalContributionsRepo,
    private readonly settingsRepo: SettingsRepo,
    private readonly transactionService: TransactionService
  ) {}

  async list(workspaceId: string): Promise<Goal[]> {
    return this.goalsRepo.list(workspaceId);
  }

  async getById(workspaceId: string, id: string): Promise<Goal | null> {
    return this.goalsRepo.getById(workspaceId, id);
  }

  async create(workspaceId: string, input: CreateGoalInput): Promise<Goal> {
    const name = normalizeName(input.name ?? "");
    if (!name) throw new AppError("VALIDATION_ERROR", "Name is required", { field: "name" });

    if (!Number.isFinite(input.targetAmountMinor) || input.targetAmountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Target must be > 0", { field: "targetAmountMinor" });
    }

    const settings = await this.settingsRepo.get(workspaceId);

    const createInput: CreateGoalInput = {
      name,
      targetAmountMinor: Math.round(input.targetAmountMinor),
      currentAmountMinor: 0,
      currency: settings.defaultCurrency,
      deadline: input.deadline ?? null,
      status: "active",
    };

    return this.goalsRepo.create(workspaceId, createInput);
  }

  async update(workspaceId: string, id: string, patch: UpdateGoalPatch): Promise<Goal> {
    const p: UpdateGoalPatch = { ...patch };

    if (p.name !== undefined) {
      const name = normalizeName(p.name);
      if (!name) throw new AppError("VALIDATION_ERROR", "Name is required", { field: "name" });
      p.name = name;
    }

    if (p.targetAmountMinor !== undefined) {
      if (!Number.isFinite(p.targetAmountMinor) || p.targetAmountMinor <= 0) {
        throw new AppError("VALIDATION_ERROR", "Target must be > 0", { field: "targetAmountMinor" });
      }
      p.targetAmountMinor = Math.round(p.targetAmountMinor);
    }

    return this.goalsRepo.update(workspaceId, id, p);
  }

  async delete(workspaceId: string, id: string): Promise<void> {
    await this.goalsRepo.softDelete(workspaceId, id);
  }

  /**
   * Пополнение цели:
   * - создаёт transfer-транзакцию
   * - создаёт GoalContribution (source of truth для reserved)
   * - обновляет goal.currentAmountMinor как кэш (через сумму contributions)
   */
  async contribute(
    workspaceId: string,
    input: Omit<CreateGoalContributionInput, "currency" | "linkedTransactionId"> & {
      dateKey?: string;
    }
  ): Promise<Goal> {
    const amountMinor = Math.round(input.amountMinor);
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be > 0", { field: "amountMinor" });
    }

    const dateKey = input.dateKey ?? todayDateKey();

    await ensureDbInitialized();

    // 1) Read goal first (outside DB transaction) so we can create transfer tx via transactions domain
    const goal = await this.goalsRepo.getById(workspaceId, input.goalId);
    if (!goal) throw new AppError("NOT_FOUND", "Goal not found", { id: input.goalId });
    if (goal.deletedAt) throw new AppError("NOT_FOUND", "Goal not found", { id: input.goalId });
    if (goal.status === "archived") {
      throw new AppError("VALIDATION_ERROR", "Cannot contribute to archived goal", { field: "status" });
    }

    // 2) Create transfer transaction ONLY via transactions domain (outside Dexie transaction)
    // Note: transaction service may add workspaceId internally; keep input minimal.
    const txInput: CreateTransactionInput = {
      workspaceId,
      type: "transfer" as const,
      amountMinor,
      currency: goal.currency,
      categoryId: null,
      note: input.note?.trim() || null,
      dateKey,
    };

    const tx = await this.transactionService.addTransaction(
      workspaceId,
      txInput
    );

    // 3) Write goalContribution + update goal cache atomically (goals domain tables only)
    try {
      return await db.transaction("rw", db.goals, db.goalContributions, async () => {
        // 3.1) contribution (source of truth)
        await this.contributionsRepo.add(workspaceId, {
          goalId: goal.id,
          amountMinor,
          currency: goal.currency,
          dateKey,
          note: input.note?.trim() || null,
          linkedTransactionId: tx.id,
        });

        // 3.2) recompute cached currentAmountMinor from contributions
        const arr = await this.contributionsRepo.listByGoalId(workspaceId, goal.id);
        const sum = arr.reduce((acc, c) => acc + c.amountMinor, 0);

        const nextStatus = sum >= goal.targetAmountMinor ? "completed" : goal.status;

        return this.goalsRepo.update(workspaceId, goal.id, {
          currentAmountMinor: sum,
          status: nextStatus,
        });
      });
    } catch (e) {
      await this.transactionService.deleteTransaction(workspaceId, tx.id);
      throw new AppError("STORAGE_ERROR", "Failed to contribute to goal", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}

export const goalsService = new GoalsService(
  goalsRepo,
  contributionsRepo,
  settingsRepo,
  transactionService
);
