import type { IGoalsRepository } from "@/core/repositories";
import type { Goal } from "@/features/goals/model/types";
import { AppError } from "@/shared/errors/app-error";

/**
 * In-Memory implementation of IGoalsRepository for testing.
 */
export class InMemoryGoalsRepository implements IGoalsRepository {
  private storage = new Map<string, Goal>();

  async list(workspaceId: string): Promise<Goal[]> {
    let results = Array.from(this.storage.values()).filter(
      (g) => g.workspaceId === workspaceId && !g.deletedAt
    );

    results.sort((a, b) => {
      const deadlineA = a.deadline ?? "9999-12-31";
      const deadlineB = b.deadline ?? "9999-12-31";
      return deadlineA.localeCompare(deadlineB);
    });

    return results;
  }

  async getById(workspaceId: string, id: string): Promise<Goal | null> {
    const g = this.storage.get(id);
    if (!g || g.workspaceId !== workspaceId || g.deletedAt) {
      return null;
    }
    return g;
  }

  async create(workspaceId: string, goal: Goal): Promise<Goal> {
    if (this.storage.has(goal.id)) {
      throw new AppError("CONFLICT", "Goal already exists", { id: goal.id });
    }
    this.storage.set(goal.id, { ...goal, workspaceId });
    return this.storage.get(goal.id)!;
  }

  async update(workspaceId: string, id: string, patch: Partial<Goal>): Promise<Goal> {
    const existing = await this.getById(workspaceId, id);
    if (!existing) {
      throw new AppError("NOT_FOUND", "Goal not found", { id });
    }

    const updated: Goal = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.storage.set(id, updated);
    return updated;
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    const existing = await this.getById(workspaceId, id);
    if (!existing) return;

    this.storage.set(id, {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Test utilities
  clear(): void {
    this.storage.clear();
  }

  getAll(): Goal[] {
    return Array.from(this.storage.values());
  }
}
