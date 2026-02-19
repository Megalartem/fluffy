import type { Budget, CreateBudgetInput, UpdateBudgetInput } from "./types";
import type { BudgetsRepo } from "../api/repo";
import type { ICategoriesRepository } from "@/core/repositories";
import type { SettingsRepo } from "@/features/settings/api/repo";
import { AppError } from "@/shared/errors/app-error";
import { nowIso } from "@/shared/lib/storage/db";
import { validateBudgetInput } from "./validators";
import { makeId } from "@/shared/lib/id";

export class BudgetsService {
  constructor(
    private readonly budgetsRepo: BudgetsRepo,
    private readonly categoriesRepo: ICategoriesRepository,
    private readonly settingsRepo: SettingsRepo
  ) {}

  /**
   * List all active budgets for workspace
   */
  async list(workspaceId: string): Promise<Budget[]> {
    return this.budgetsRepo.list(workspaceId);
  }

  /**
   * Get budget by ID
   */
  async getById(workspaceId: string, id: string): Promise<Budget | null> {
    return this.budgetsRepo.getById(workspaceId, id);
  }

  /**
   * Get budget by category ID
   */
  async getByCategoryId(workspaceId: string, categoryId: string): Promise<Budget | null> {
    return this.budgetsRepo.getByCategoryId(workspaceId, categoryId);
  }

  /**
   * Create a new budget
   * 
   * Validations:
   * - Category must exist
   * - Category must be type="expense"
   * - limitMinor must be > 0
   * - Only one active budget per category
   */
  async create(workspaceId: string, input: CreateBudgetInput): Promise<Budget> {
    // Validate input
    validateBudgetInput(input);

    // Check category exists and is expense type
    const category = await this.categoriesRepo.getById(workspaceId, input.categoryId);
    if (!category) {
      throw new AppError("NOT_FOUND", "Category not found", { 
        field: "categoryId",
        categoryId: input.categoryId 
      });
    }

    if (category.type !== "expense") {
      throw new AppError("VALIDATION_ERROR", "Budget can only be created for expense categories", {
        field: "categoryId",
        categoryType: category.type
      });
    }

    // Check for existing budget (repo will throw CONFLICT if duplicate)
    const existing = await this.budgetsRepo.getByCategoryId(workspaceId, input.categoryId);
    if (existing) {
      throw new AppError("CONFLICT", "Budget already exists for this category", {
        field: "categoryId",
        existingBudgetId: existing.id
      });
    }

    // Get default currency from settings if not provided
    const settings = await this.settingsRepo.get(workspaceId);

    const now = nowIso();
    const budget: Budget = {
      id: makeId("bdg"),
      workspaceId,
      categoryId: input.categoryId,
      period: input.period,
      currency: input.currency || settings.defaultCurrency,
      limitMinor: Math.round(input.limitMinor),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    return this.budgetsRepo.create(workspaceId, budget);
  }

  /**
   * Update budget
   * 
   * Can update: limitMinor, period, categoryId
   * When changing categoryId, validates no duplicate budget exists
   */
  async update(workspaceId: string, input: UpdateBudgetInput): Promise<Budget> {
    const patch = { ...input.patch };

    // Validate categoryId if provided (check for duplicates)
    if (patch.categoryId !== undefined) {
      // Check category exists and is expense type
      const category = await this.categoriesRepo.getById(workspaceId, patch.categoryId);
      if (!category) {
        throw new AppError("NOT_FOUND", "Category not found", { 
          field: "categoryId",
          categoryId: patch.categoryId 
        });
      }

      if (category.type !== "expense") {
        throw new AppError("VALIDATION_ERROR", "Budget can only be set for expense categories", {
          field: "categoryId",
          categoryType: category.type
        });
      }

      // Check if another budget already exists for this category
      const existing = await this.budgetsRepo.getByCategoryId(workspaceId, patch.categoryId);
      if (existing && existing.id !== input.id) {
        throw new AppError("CONFLICT", "Budget already exists for this category", {
          field: "categoryId",
          existingBudgetId: existing.id
        });
      }
    }

    // Validate limitMinor if provided
    if (patch.limitMinor !== undefined) {
      if (!Number.isFinite(patch.limitMinor) || patch.limitMinor <= 0) {
        throw new AppError("VALIDATION_ERROR", "Limit must be greater than 0", {
          field: "limitMinor"
        });
      }
      patch.limitMinor = Math.round(patch.limitMinor);
    }

    return this.budgetsRepo.update(workspaceId, input.id, {
      ...patch,
      updatedAt: nowIso(),
    });
  }

  /**
   * Soft delete budget
   */
  async delete(workspaceId: string, id: string): Promise<void> {
    await this.budgetsRepo.softDelete(workspaceId, id);
  }
}
