import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";
import type { GoalsRepo } from "./repo";
import type { Goal } from "../model/types";

export class DexieGoalsRepo implements GoalsRepo {
  async list(workspaceId: string): Promise<Goal[]> {
    await ensureDbInitialized();
    const arr = await db.goals
      .where("workspaceId")
      .equals(workspaceId)
      .filter((g) => !g.deletedAt)
      .toArray();

    // простая сортировка: ближайший дедлайн/по созданию
    arr.sort((a, b) => (a.deadline ?? "9999-12-31").localeCompare(b.deadline ?? "9999-12-31"));
    return arr;
  }

  async getById(workspaceId: string, id: string): Promise<Goal | null> {
    await ensureDbInitialized();
    const g = await db.goals.get(id);
    if (!g || g.workspaceId !== workspaceId || g.deletedAt) return null;
    return g;
  }

  async create(workspaceId: string, goal: Goal): Promise<Goal> {
    try {
      await ensureDbInitialized();
      await db.goals.put(goal);
      return goal;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to create goal", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async update(workspaceId: string, id: string, patch: Partial<Goal>): Promise<Goal> {
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
