import { AppError } from "@/shared/errors/app-error";
import type {
  CreateGoalContributionInput,
  GoalContribution,
  GoalStatus,
  UpdateGoalContributionPatch,
} from "@/features/goals/model/types";
import type { GoalContributionsRepo, GoalsRepo } from "@/features/goals/api/repo";
import type { TransactionService } from "@/features/transactions/model/service";
import type { UpdateTransactionPatch } from "@/features/transactions/model/types";
import { createDomainLogger } from "@/shared/logging/logger";

const logger = createDomainLogger("goals:contributions");
const isDateKey = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

function normalizeNote(note?: string | null) {
  const s = (note ?? "").trim();
  return s ? s : null;
}

function assertPositiveMinor(amountMinor: number) {
  if (!Number.isFinite(amountMinor) || Math.trunc(amountMinor) !== amountMinor) {
    throw new AppError("VALIDATION_ERROR", "Amount must be an integer (minor units)", {
      field: "amountMinor",
    });
  }
  if (amountMinor <= 0) {
    throw new AppError("VALIDATION_ERROR", "Amount must be > 0", { field: "amountMinor" });
  }
}

function assertDateKey(dateKey: string) {
  if (!isDateKey(dateKey)) {
    throw new AppError("VALIDATION_ERROR", "Invalid date", { field: "dateKey" });
  }
}

function resolveStatus(currentAmountMinor: number, targetAmountMinor: number, currentStatus: GoalStatus): GoalStatus {
  if (currentStatus === "archived") return "archived";
  return currentAmountMinor >= targetAmountMinor ? "completed" : "active";
}

export class GoalContributionsService {
  constructor(
    private readonly contributionsRepo: GoalContributionsRepo,
    private readonly goalsRepo: GoalsRepo,
    private readonly transactionService: TransactionService
  ) {}

  async listByGoalId(workspaceId: string, goalId: string): Promise<GoalContribution[]> {
    if (!goalId) return [];
    const list = await this.contributionsRepo.listByGoalId(workspaceId, goalId);
    list.sort((a: GoalContribution, b: GoalContribution) => (b.dateKey ?? "").localeCompare(a.dateKey ?? ""));
    return list;
  }

  async getById(workspaceId: string, id: string): Promise<GoalContribution | null> {
    if (!id) return null;
    return this.contributionsRepo.getById(workspaceId, id);
  }

  async findByLinkedTransactionId(workspaceId: string, txId: string): Promise<GoalContribution | null> {
    if (!txId) return null;
    return this.contributionsRepo.findByLinkedTransactionId(workspaceId, txId);
  }

  async add(workspaceId: string, input: CreateGoalContributionInput): Promise<GoalContribution> {
    if (!input.goalId) {
      throw new AppError("VALIDATION_ERROR", "Goal is required", { field: "goalId" });
    }
    assertPositiveMinor(input.amountMinor);
    assertDateKey(input.dateKey);

    const payload: CreateGoalContributionInput = {
      ...input,
      note: normalizeNote(input.note),
      linkedTransactionId: input.linkedTransactionId ?? null,
    };

    return this.contributionsRepo.add(workspaceId, payload);
  }

  async update(workspaceId: string, id: string, patch: UpdateGoalContributionPatch): Promise<GoalContribution> {
    if (!id) throw new AppError("VALIDATION_ERROR", "Id is required", { field: "id" });

    if (patch.amountMinor !== undefined) assertPositiveMinor(patch.amountMinor);
    if (patch.dateKey !== undefined && patch.dateKey !== null) assertDateKey(patch.dateKey);

    const payload: UpdateGoalContributionPatch = {
      ...patch,
      note: patch.note !== undefined ? normalizeNote(patch.note) : undefined,
    };

    return this.contributionsRepo.update(workspaceId, id, payload);
  }

  async updateAndRecalculate(
    workspaceId: string,
    id: string,
    patch: UpdateGoalContributionPatch
  ): Promise<void> {
    const contribution = await this.getById(workspaceId, id);
    if (!contribution) return;

    await this.update(workspaceId, id, patch);

    if (contribution.linkedTransactionId) {
      const txPatch: UpdateTransactionPatch = {};
      if (patch.amountMinor !== undefined) txPatch.amountMinor = patch.amountMinor;
      if (patch.dateKey !== undefined) txPatch.dateKey = patch.dateKey;
      if (patch.note !== undefined) txPatch.note = patch.note;

      if (Object.keys(txPatch).length > 0) {
        try {
          await this.transactionService.updateTransaction(workspaceId, {
            id: contribution.linkedTransactionId,
            patch: txPatch,
          });
        } catch (error) {
          logger.warn("failed to sync linked transaction", {
            workspaceId,
            contributionId: id,
            linkedTransactionId: contribution.linkedTransactionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    await this.recalculateGoalProgress(workspaceId, contribution.goalId);
  }

  async delete(workspaceId: string, id: string): Promise<void> {
    if (!id) return;

    const contribution = await this.contributionsRepo.getById(workspaceId, id);
    if (!contribution) return;

    if (contribution.linkedTransactionId) {
      try {
        await this.transactionService.deleteTransaction(workspaceId, contribution.linkedTransactionId);
      } catch (e) {
        const tx = await this.transactionService.getTransaction(workspaceId, contribution.linkedTransactionId);
        if (tx && !tx.deletedAt) {
          throw new AppError("STORAGE_ERROR", "Failed to delete linked transaction", {
            cause: e instanceof Error ? e.message : String(e),
            linkedTransactionId: contribution.linkedTransactionId,
          });
        }

        logger.info("linked transaction already deleted", {
          workspaceId,
          linkedTransactionId: contribution.linkedTransactionId,
        });
      }
    }

    await this.contributionsRepo.softDelete(workspaceId, id);
  }

  async deleteAndRecalculate(workspaceId: string, id: string): Promise<void> {
    const contribution = await this.getById(workspaceId, id);
    if (!contribution) return;

    await this.delete(workspaceId, id);
    await this.recalculateGoalProgress(workspaceId, contribution.goalId);
  }

  private async recalculateGoalProgress(workspaceId: string, goalId: string): Promise<void> {
    const goal = await this.goalsRepo.getById(workspaceId, goalId);
    if (!goal) return;

    const allContributions = await this.contributionsRepo.listByGoalId(workspaceId, goalId);
    const currentAmountMinor = allContributions.reduce((sum, c) => sum + c.amountMinor, 0);

    await this.goalsRepo.update(workspaceId, goalId, {
      currentAmountMinor,
      status: resolveStatus(currentAmountMinor, goal.targetAmountMinor, goal.status),
    });
  }
}
