import type { Category, CreateCategoryInput } from "../model/types";
import type { ICategoriesRepository } from "@/core/repositories"; // или твой CategoriesRepo
import type { TransactionsRepo } from "@/features/transactions/api/repo";
import type { BudgetsRepo } from "@/features/budgets/api/repo";
import { AppError } from "@/shared/errors/app-error";
import { nowIso } from "@/shared/lib/storage/db";
import { makeId } from "@/shared/lib/id";

import type { UpdateCategoryInput } from "./types";

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export class CategoryService {
  constructor(
    private readonly categoriesRepo: ICategoriesRepository,
    private readonly transactionsRepo: TransactionsRepo,
    private readonly budgetsRepo: BudgetsRepo
  ) {}

  async addCategory(workspaceId: string, input: CreateCategoryInput): Promise<Category> {
    const name = normalizeName(input.name ?? "");
    if (!name) {
      throw new AppError("VALIDATION_ERROR", "Name is required", { field: "name" });
    }

    // Auto-calculate order if not provided or invalid
    let order = input.order;
    if (!Number.isFinite(order) || order < 0) {
      // Get max order from existing categories and add 10
      const existingCategories = await this.categoriesRepo.list(workspaceId);
      const maxOrder = existingCategories.reduce((max, cat) => Math.max(max, cat.order), 0);
      order = maxOrder + 10;
    }

    const now = nowIso();

    const category: Category = {
      id: makeId("cat"),
      workspaceId,
      name,
      type: input.type,
      iconKey: input.iconKey,
      colorKey: input.colorKey,
      order,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    return this.categoriesRepo.create(workspaceId, category);
  }

  async updateCategory(workspaceId: string, input: UpdateCategoryInput): Promise<Category> {
    const patch = { ...input.patch };

    if (patch.name !== undefined) {
      const name = normalizeName(patch.name);
      if (!name) {
        throw new AppError("VALIDATION_ERROR", "Name is required", { field: "name" });
      }
      patch.name = name;
    }

    if (patch.order !== undefined) {
      if (!Number.isFinite(patch.order) || patch.order < 0) {
        throw new AppError("VALIDATION_ERROR", "Order must be a non-negative number", { field: "order" });
      }
    }

    return this.categoriesRepo.update(workspaceId, input.id, {
      ...patch,
      updatedAt: nowIso(),
    });
  }

  async archiveCategory(workspaceId: string, id: string, isArchived: boolean): Promise<Category> {
    return this.categoriesRepo.update(workspaceId, id, {
      isArchived,
      updatedAt: nowIso(),
    });
  }

  async deleteCategory(workspaceId: string, id: string): Promise<void> {
    // 1) soft delete category
    await this.categoriesRepo.softDelete(workspaceId, id);

    // 2) cleanup transactions -> categoryId = null
    await this.transactionsRepo.unsetCategory(workspaceId, id);

    // 3) soft delete associated budget (if any)
    const budget = await this.budgetsRepo.getByCategoryId(workspaceId, id);
    if (budget) {
      await this.budgetsRepo.softDelete(workspaceId, budget.id);
    }
  }
}
