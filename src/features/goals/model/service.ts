import { DexieGoalsRepo } from "@/features/goals/api/repo.dexie";
import type { GoalsRepo } from "@/features/goals/api/repo";
import type { CreateGoalInput, UpdateGoalPatch, Goal } from "./types";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { AppError } from "@/shared/errors/app-error";

export class GoalsService {
  constructor(
    private repo: GoalsRepo = new DexieGoalsRepo(),
    private settingsRepo = new DexieSettingsRepo()
  ) {}

  async list(workspaceId: string) {
    return this.repo.list(workspaceId);
  }

  async create(workspaceId: string, input: CreateGoalInput): Promise<Goal> {
    const name = input.name.trim();
    if (!name) throw new AppError("VALIDATION_ERROR", "Name is required", { field: "name" });
    if (!Number.isFinite(input.targetAmountMinor) || input.targetAmountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Target must be > 0", { field: "targetAmountMinor" });
    }

    const settings = await this.settingsRepo.get(workspaceId);

    const createInput: CreateGoalInput = {
      name,
      targetAmountMinor: input.targetAmountMinor,
      currency: settings.defaultCurrency,
      deadline: input.deadline ?? null,
      status: "active" as const,
      currentAmountMinor: input.currentAmountMinor ?? 0,
    };

    return this.repo.create(workspaceId, createInput);
  }

  async update(workspaceId: string, id: string, patch: UpdateGoalPatch) {
    if (patch.targetAmountMinor !== undefined && patch.targetAmountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Target must be > 0", { field: "targetAmountMinor" });
    }
    return this.repo.update(workspaceId, id, patch);
  }

  async addToGoal(workspaceId: string, id: string, amountMinor: number) {
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be > 0", { field: "amountMinor" });
    }
    const g = await this.repo.getById(workspaceId, id);
    if (!g) throw new AppError("NOT_FOUND", "Goal not found", { id });
    const newCurrentAmountMinor = g.currentAmountMinor + amountMinor;
    const patch: UpdateGoalPatch = {};
    if (newCurrentAmountMinor >= g.targetAmountMinor) {
      patch.status = "completed";
    }
    return this.repo.update(workspaceId, id, patch);
  }

  async delete(workspaceId: string, id: string) {
    return this.repo.softDelete(workspaceId, id);
  }
}
