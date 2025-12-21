import { DexieGoalsRepo } from "@/features/goals/api/repo.dexie";
import type { GoalsRepo } from "@/features/goals/api/repo";
import type { CreateGoalInput, UpdateGoalPatch, Goal } from "./types";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class GoalsService {
  constructor(
    private repo: GoalsRepo = new DexieGoalsRepo(),
    private settingsRepo = new DexieSettingsRepo()
  ) {}

  async list(workspaceId: string) {
    return this.repo.list(workspaceId);
  }

  async create(workspaceId: string, input: CreateGoalInput): Promise<Goal> {
    const title = input.title.trim();
    if (!title) throw new AppError("VALIDATION_ERROR", "Title is required", { field: "title" });
    if (!Number.isFinite(input.targetAmount) || input.targetAmount <= 0) {
      throw new AppError("VALIDATION_ERROR", "Target must be > 0", { field: "targetAmount" });
    }

    const settings = await this.settingsRepo.get(workspaceId);
    const now = nowIso();

    const goal: Goal = {
      id: makeId("goal"),
      workspaceId,
      title,
      targetAmount: input.targetAmount,
      currentAmount: input.currentAmount ?? 0,
      currency: settings.defaultCurrency,
      deadline: input.deadline ?? null,
      note: input.note?.trim() ? input.note.trim() : null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    return this.repo.create(workspaceId, goal);
  }

  async update(workspaceId: string, id: string, patch: UpdateGoalPatch) {
    if (patch.targetAmount !== undefined && patch.targetAmount <= 0) {
      throw new AppError("VALIDATION_ERROR", "Target must be > 0", { field: "targetAmount" });
    }
    if (patch.currentAmount !== undefined && patch.currentAmount < 0) {
      throw new AppError("VALIDATION_ERROR", "Current amount must be >= 0", { field: "currentAmount" });
    }
    return this.repo.update(workspaceId, id, patch);
  }

  async addToGoal(workspaceId: string, id: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be > 0", { field: "amount" });
    }
    const g = await this.repo.getById(workspaceId, id);
    if (!g) throw new AppError("NOT_FOUND", "Goal not found", { id });
    return this.repo.update(workspaceId, id, { currentAmount: g.currentAmount + amount });
  }

  async delete(workspaceId: string, id: string) {
    return this.repo.softDelete(workspaceId, id);
  }
}
