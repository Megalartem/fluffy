import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import { AppError } from "@/shared/errors/app-error";
import type { CategoriesRepo } from "./repo";
import type { Category } from "../model/types";

export class DexieCategoriesRepo implements CategoriesRepo {
  async list(workspaceId: string): Promise<Category[]> {
    try {
      await ensureDbInitialized();
      const arr = await db.categories
        .where("workspaceId")
        .equals(workspaceId)
        .filter((c) => !c.deletedAt)
        .toArray();

      arr.sort((a, b) => a.order - b.order);
      return arr;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to list categories", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async getById(workspaceId: string, id: string): Promise<Category | null> {
    await ensureDbInitialized();
    const c = await db.categories.get(id);
    if (!c || c.workspaceId !== workspaceId || c.deletedAt) return null;
    return c;
  }

  async create(workspaceId: string, category: Category): Promise<Category> {
    try {
      await ensureDbInitialized();
      await db.categories.put(category);
      return category;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to create category", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async update(workspaceId: string, id: string, patch: Partial<Category>): Promise<Category> {
    await ensureDbInitialized();
    const existing = await this.getById(workspaceId, id);
    if (!existing) throw new AppError("NOT_FOUND", "Category not found", { id });

    const updated: Category = { ...existing, ...patch, updatedAt: nowIso() };
    await db.categories.put(updated);
    return updated;
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    await ensureDbInitialized();
    const existing = await this.getById(workspaceId, id);
    if (!existing) return;

    await db.categories.put({
      ...existing,
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
}
