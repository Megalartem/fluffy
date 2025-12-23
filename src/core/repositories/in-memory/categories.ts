import type { ICategoriesRepository } from "@/core/repositories";
import type { Category } from "@/features/categories/model/types";
import { AppError } from "@/shared/errors/app-error";

/**
 * In-Memory implementation of ICategoriesRepository for testing.
 */
export class InMemoryCategoriesRepository implements ICategoriesRepository {
  private storage = new Map<string, Category>();

  async list(workspaceId: string): Promise<Category[]> {
    let results = Array.from(this.storage.values()).filter(
      (c) => c.workspaceId === workspaceId && !c.deletedAt
    );

    results.sort((a, b) => a.order - b.order);
    return results;
  }

  async getById(workspaceId: string, id: string): Promise<Category | null> {
    const c = this.storage.get(id);
    if (!c || c.workspaceId !== workspaceId || c.deletedAt) {
      return null;
    }
    return c;
  }

  async create(workspaceId: string, category: Category): Promise<Category> {
    if (this.storage.has(category.id)) {
      throw new AppError("CONFLICT", "Category already exists", { id: category.id });
    }
    this.storage.set(category.id, { ...category, workspaceId });
    return this.storage.get(category.id)!;
  }

  async update(workspaceId: string, id: string, patch: Partial<Category>): Promise<Category> {
    const existing = await this.getById(workspaceId, id);
    if (!existing) {
      throw new AppError("NOT_FOUND", "Category not found", { id });
    }

    const updated: Category = {
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

  getAll(): Category[] {
    return Array.from(this.storage.values());
  }
}
