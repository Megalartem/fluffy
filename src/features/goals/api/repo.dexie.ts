import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";
import type { GoalsRepo, GoalContributionsRepo } from "./repo";
import type { CreateGoalContributionInput, CreateGoalInput, Goal, GoalContribution, GoalStatus, UpdateGoalContributionPatch, UpdateGoalPatch } from "../model/types";

export class DexieGoalsRepo implements GoalsRepo {
  async list(
    workspaceId: string,
    query?: { status?: GoalStatus | GoalStatus[] }
  ): Promise<Goal[]> {
    await ensureDbInitialized();
    let arr = await db.goals
      .where("workspaceId")
      .equals(workspaceId)
      .filter((g) => !g.deletedAt)
      .toArray();

    if (query?.status !== undefined) {
      if (Array.isArray(query.status)) {
        arr = arr.filter((g) => query.status!.includes(g.status));
      } else {
        arr = arr.filter((g) => g.status === query.status);
      }
    }

    arr.sort((a, b) => (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31"));
    return arr;
  }

  async getById(workspaceId: string, id: string): Promise<Goal | null> {
    await ensureDbInitialized();
    const g = await db.goals.get(id);
    if (!g || g.workspaceId !== workspaceId || g.deletedAt) return null;
    return g;
  }

  async create(workspaceId: string, input: CreateGoalInput): Promise<Goal> {
    try {
      await ensureDbInitialized();
      const now = nowIso();
      const goal: Goal = {
        ...input,
        id: crypto.randomUUID(),
        workspaceId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      await db.goals.put(goal);
      return goal;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to create goal", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async update(workspaceId: string, id: string, patch: UpdateGoalPatch): Promise<Goal> {
    await ensureDbInitialized();
    const existing = await this.getById(workspaceId, id);
    if (!existing) throw new AppError("NOT_FOUND", "Goal not found", { id });

    const updated: Goal = { ...existing, ...patch, updatedAt: nowIso() };
    await db.goals.put(updated);
    return updated;
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    await ensureDbInitialized();
    const existing = await this.getById(workspaceId, id);
    if (!existing) return;

    await db.goals.put({ ...existing, deletedAt: nowIso(), updatedAt: nowIso() });
  }
}


export class DexieGoalContributionsRepo implements GoalContributionsRepo {
  async listByGoalId(workspaceId: string, goalId: string): Promise<GoalContribution[]> {
    await ensureDbInitialized();
    const arr = await db.goalContributions
      .where("[workspaceId+goalId]")
      .equals([workspaceId, goalId])
      .filter((gc) => !gc.deletedAt)
      .toArray();

    arr.sort((a,b) => (b.dateKey + b.createdAt).localeCompare(a.dateKey + a.createdAt));
    return arr;
  }

  async listByWorkspaceId(workspaceId: string): Promise<GoalContribution[]> {
    await ensureDbInitialized();
    const arr = await db.goalContributions
      .where("workspaceId")
      .equals(workspaceId)
      .filter((gc) => !gc.deletedAt)
      .toArray();
    
    arr.sort((a,b) => (b.dateKey + b.createdAt).localeCompare(a.dateKey + a.createdAt));
    return arr;
    
  }

  async getById(workspaceId: string, id: string): Promise<GoalContribution | null> {
    await ensureDbInitialized();
    const gc = await db.goalContributions.get(id);
    if (!gc || gc.workspaceId !== workspaceId || gc.deletedAt) return null;
    return gc;
  }

  async add(workspaceId: string, input: CreateGoalContributionInput): Promise<GoalContribution> {
    try {
      await ensureDbInitialized();
      const now = nowIso();
      const gc: GoalContribution = {
        ...input,
        id: crypto.randomUUID(),
        workspaceId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      await db.goalContributions.put(gc);
      return gc;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to add goal contribution", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async update(workspaceId: string, id: string, patch: UpdateGoalContributionPatch): Promise<GoalContribution> {
    await ensureDbInitialized();
    const existing = await this.getById(workspaceId, id);
    if (!existing) throw new AppError("NOT_FOUND", "Goal contribution not found", { id });

    const updated: GoalContribution = { ...existing, ...patch, updatedAt: nowIso() };
    await db.goalContributions.put(updated);
    return updated;
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    await ensureDbInitialized();
    const existing = await this.getById(workspaceId, id);
    if (!existing) return;

    await db.goalContributions.put({ ...existing, deletedAt: nowIso(), updatedAt: nowIso() });
  }
}