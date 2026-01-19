import type { Category, CreateCategoryInput } from "../model/types";
import type { ICategoriesRepository } from "@/core/repositories"; // или твой CategoriesRepo
import type { TransactionsRepo } from "@/features/transactions/api/repo";
import { AppError } from "@/shared/errors/app-error";
import { nowIso } from "@/shared/lib/storage/db";

import { transactionsRepo } from "@/features/transactions/api/repo.dexie";
import { DexieCategoriesRepo } from "../api/repo.dexie"; // подправь импорт под свой файл
import type { UpdateCategoryInput } from "./types";

function makeId(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${uuid}`;
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export class CategoryService {
  constructor(
    private readonly categoriesRepo: ICategoriesRepository,
    private readonly transactionsRepo: TransactionsRepo
  ) {}

  async addCategory(workspaceId: string, input: CreateCategoryInput): Promise<Category> {
    const name = normalizeName(input.name ?? "");
    if (!name) {
      throw new AppError("VALIDATION_ERROR", "Name is required", { field: "name" });
    }

    // (опционально) валидация order
    if (!Number.isFinite(input.order) || input.order < 0) {
      throw new AppError("VALIDATION_ERROR", "Order must be a non-negative number", { field: "order" });
    }

    const now = nowIso();

    const category: Category = {
      id: makeId("cat"),
      workspaceId,
      name,
      type: input.type,
      iconKey: input.iconKey,
      colorKey: input.colorKey,
      order: input.order,
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
  }
}

// singleton как у тебя
export const categoryService = new CategoryService(
  new DexieCategoriesRepo(),
  transactionsRepo
);