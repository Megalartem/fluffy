import type { CreateBudgetInput, UpdateBudgetPatch } from "./types";
import { AppError } from "@/shared/errors/app-error";

/**
 * Maximum budget limit (999,999,999 in minor units = ~10 million in major units)
 */
export const MAX_BUDGET_LIMIT = 999_999_999_999 as const;

/**
 * Minimum budget limit (1 in minor units)
 */
export const MIN_BUDGET_LIMIT = 1 as const;

/**
 * Validate budget creation input
 * 
 * @throws AppError if validation fails
 */
export function validateBudgetInput(input: CreateBudgetInput): void {
  // Validate categoryId
  if (!input.categoryId || typeof input.categoryId !== "string") {
    throw new AppError("VALIDATION_ERROR", "Category ID is required", {
      field: "categoryId"
    });
  }

  // Validate limitMinor
  if (!Number.isFinite(input.limitMinor)) {
    throw new AppError("VALIDATION_ERROR", "Limit must be a valid number", {
      field: "limitMinor"
    });
  }

  if (input.limitMinor < MIN_BUDGET_LIMIT) {
    throw new AppError("VALIDATION_ERROR", `Limit must be at least ${MIN_BUDGET_LIMIT}`, {
      field: "limitMinor",
      min: MIN_BUDGET_LIMIT
    });
  }

  if (input.limitMinor > MAX_BUDGET_LIMIT) {
    throw new AppError("VALIDATION_ERROR", `Limit cannot exceed ${MAX_BUDGET_LIMIT}`, {
      field: "limitMinor",
      max: MAX_BUDGET_LIMIT
    });
  }

  // Validate period
  if (input.period !== "monthly") {
    throw new AppError("VALIDATION_ERROR", "Period must be 'monthly'", {
      field: "period",
      allowedValues: ["monthly"]
    });
  }

  // Validate currency
  if (input.currency && typeof input.currency !== "string") {
    throw new AppError("VALIDATION_ERROR", "Currency must be a valid string", {
      field: "currency"
    });
  }
}

/**
 * Validate budget update patch
 * 
 * @throws AppError if validation fails
 */
export function validateBudgetPatch(patch: UpdateBudgetPatch): void {
  // Validate categoryId if provided
  if (patch.categoryId !== undefined) {
    if (typeof patch.categoryId !== "string" || !patch.categoryId.trim()) {
      throw new AppError("VALIDATION_ERROR", "Category ID must be a non-empty string", {
        field: "categoryId"
      });
    }
  }

  // Validate limitMinor if provided
  if (patch.limitMinor !== undefined) {
    if (!Number.isFinite(patch.limitMinor)) {
      throw new AppError("VALIDATION_ERROR", "Limit must be a valid number", {
        field: "limitMinor"
      });
    }

    if (patch.limitMinor < MIN_BUDGET_LIMIT) {
      throw new AppError("VALIDATION_ERROR", `Limit must be at least ${MIN_BUDGET_LIMIT}`, {
        field: "limitMinor",
        min: MIN_BUDGET_LIMIT
      });
    }

    if (patch.limitMinor > MAX_BUDGET_LIMIT) {
      throw new AppError("VALIDATION_ERROR", `Limit cannot exceed ${MAX_BUDGET_LIMIT}`, {
        field: "limitMinor",
        max: MAX_BUDGET_LIMIT
      });
    }
  }

  // Validate period if provided
  if (patch.period !== undefined && patch.period !== "monthly") {
    throw new AppError("VALIDATION_ERROR", "Period must be 'monthly'", {
      field: "period",
      allowedValues: ["monthly"]
    });
  }
}
