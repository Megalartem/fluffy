import { AppError } from "@/shared/errors/app-error";
import type {
  CreateGoalContributionInput,
  GoalContribution,
  UpdateGoalContributionPatch,
} from "@/features/goals/model/types";
import { contributionsRepo } from "@/features/goals/api/repo.dexie";
import { transactionService } from "@/features/transactions/model/service";

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

export class GoalContributionsService {
  async listByGoalId(workspaceId: string, goalId: string): Promise<GoalContribution[]> {
    if (!goalId) return [];
    const list = await contributionsRepo.listByGoalId(workspaceId, goalId);
    // default sort: newest first
    list.sort((a: GoalContribution, b: GoalContribution) => (b.dateKey ?? "").localeCompare(a.dateKey ?? ""));
    return list;
  }

  async getById(workspaceId: string, id: string): Promise<GoalContribution | null> {
    if (!id) return null;
    return contributionsRepo.getById(workspaceId, id);
  }

  async findByLinkedTransactionId(workspaceId: string, txId: string): Promise<GoalContribution | null> {
    if (!txId) return null;
    return contributionsRepo.findByLinkedTransactionId(workspaceId, txId);
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

    return contributionsRepo.add(workspaceId, payload);
  }

  async update(
    workspaceId: string,
    id: string,
    patch: UpdateGoalContributionPatch
  ): Promise<GoalContribution> {
    if (!id) throw new AppError("VALIDATION_ERROR", "Id is required", { field: "id" });

    if (patch.amountMinor !== undefined) assertPositiveMinor(patch.amountMinor);
    if (patch.dateKey !== undefined && patch.dateKey !== null) assertDateKey(patch.dateKey);

    const payload: UpdateGoalContributionPatch = {
      ...patch,
      note: patch.note !== undefined ? normalizeNote(patch.note) : undefined,
    };

    return contributionsRepo.update(workspaceId, id, payload);
  }

  async delete(workspaceId: string, id: string): Promise<void> {
    if (!id) return;
    
    // 1. Get contribution to check for linked transaction
    const contribution = await contributionsRepo.getById(workspaceId, id);
    if (!contribution) return;
    
    // 2. If there's a linked transaction, delete it first
    if (contribution.linkedTransactionId) {
      try {
        await transactionService.deleteTransaction(workspaceId, contribution.linkedTransactionId);
      } catch (e) {
        // Check if transaction still exists before treating as error
        const tx = await transactionService.getTransaction(workspaceId, contribution.linkedTransactionId);
        if (tx && !tx.deletedAt) {
          // Transaction exists but failed to delete - this is a real error
          throw new AppError("STORAGE_ERROR", "Failed to delete linked transaction", {
            cause: e instanceof Error ? e.message : String(e),
            linkedTransactionId: contribution.linkedTransactionId,
          });
        }
        // Transaction already deleted or doesn't exist - safe to continue
        console.log("Linked transaction already deleted:", contribution.linkedTransactionId);
      }
    }
    
    // 3. Delete the contribution
    await contributionsRepo.softDelete(workspaceId, id);
  }
}

export const goalContributionsService = new GoalContributionsService();