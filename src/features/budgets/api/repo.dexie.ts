import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";
import type { BudgetsRepo } from "./repo";
import type { Budget } from "../model/types";

export class DexieBudgetsRepo implements BudgetsRepo {
  async list(workspaceId: string): Promise<Budget[]> {
    try {
      await ensureDbInitialized();
      const budgets = await db.budgets
        .where("workspaceId")
        .equals(workspaceId)
        .filter((b) => !b.deletedAt)
        .toArray();

      return budgets;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to list budgets", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async getById(workspaceId: string, id: string): Promise<Budget | null> {
    try {
      await ensureDbInitialized();
      const budget = await db.budgets.get(id);
      if (!budget || budget.workspaceId !== workspaceId || budget.deletedAt) {
        return null;
      }
      return budget;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to get budget by id", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async getByCategoryId(workspaceId: string, categoryId: string): Promise<Budget | null> {
    try {
      await ensureDbInitialized();
      
      // Find active budget for this category
      const budget = await db.budgets
        .where("[workspaceId+categoryId]")
        .equals([workspaceId, categoryId])
        .filter((b) => !b.deletedAt)
        .first();

      return budget ?? null;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to get budget by category", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async create(workspaceId: string, budget: Budget): Promise<Budget> {
    try {
      await ensureDbInitialized();

      // Check for duplicate budget for this category
      const existing = await this.getByCategoryId(workspaceId, budget.categoryId);
      if (existing) {
        throw new AppError(
          "CONFLICT",
          "Budget already exists for this category",
          { categoryId: budget.categoryId }
        );
      }

      await db.budgets.put(budget);
      return budget;
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError("STORAGE_ERROR", "Failed to create budget", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async update(workspaceId: string, id: string, patch: Partial<Budget>): Promise<Budget> {
    try {
      await ensureDbInitialized();
      
      const existing = await this.getById(workspaceId, id);
      if (!existing) {
        throw new AppError("NOT_FOUND", "Budget not found", { id });
      }

      const updated: Budget = {
        ...existing,
        ...patch,
        updatedAt: nowIso(),
      };

      await db.budgets.put(updated);
      return updated;
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError("STORAGE_ERROR", "Failed to update budget", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    try {
      await ensureDbInitialized();
      
      const existing = await this.getById(workspaceId, id);
      if (!existing) {
        return; // Already deleted or doesn't exist
      }

      await db.budgets.put({
        ...existing,
        deletedAt: nowIso(),
        updatedAt: nowIso(),
      });
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to soft delete budget", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}

export const budgetsRepo = new DexieBudgetsRepo();
