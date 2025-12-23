/**
 * Validators - Data validation layer
 *
 * Provides type-safe validation for all entities:
 * - Transactions
 * - Categories
 * - Budgets
 * - Goals
 * - Settings
 *
 * Returns ValidationResult with detailed error information
 */

import { LIMITS } from "@/shared/constants/limits";
import { TRANSACTION_TYPES } from "@/shared/constants/transaction";
import type { Transaction } from "@/features/transactions/model/types";
import type { Category } from "@/features/categories/model/types";
import type { MonthlyBudget } from "@/features/budgets/model/types";
import type { Goal } from "@/features/goals/model/types";
import type { AppSettings } from "@/features/settings/model/types";

/**
 * Validation result
 */
export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors: ValidationError[];
}

/**
 * Single validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code:
    | "REQUIRED"
    | "TYPE_MISMATCH"
    | "OUT_OF_RANGE"
    | "INVALID_FORMAT"
    | "DUPLICATE"
    | "NOT_FOUND"
    | "BUSINESS_RULE";
}

/**
 * Transaction validators
 */
export const transactionValidators = {
  /**
   * Validate transaction creation payload
   */
  validateCreate(data: unknown): ValidationResult<Partial<Transaction>> {
    const errors: ValidationError[] = [];
    const payload = data as Record<string, unknown>;

    // Type
    if (!payload.type || !TRANSACTION_TYPES.includes(payload.type as "expense" | "income")) {
      errors.push({
        field: "type",
        message: "Must be 'expense' or 'income'",
        code: "INVALID_FORMAT",
      });
    }

    // Amount
    if (!payload.amount || typeof payload.amount !== "number") {
      errors.push({
        field: "amount",
        message: "Amount is required and must be a number",
        code: "REQUIRED",
      });
    } else if (payload.amount < LIMITS.MIN_TRANSACTION_AMOUNT) {
      errors.push({
        field: "amount",
        message: `Minimum amount is ${LIMITS.MIN_TRANSACTION_AMOUNT}`,
        code: "OUT_OF_RANGE",
      });
    } else if (payload.amount > LIMITS.MAX_TRANSACTION_AMOUNT) {
      errors.push({
        field: "amount",
        message: `Maximum amount is ${LIMITS.MAX_TRANSACTION_AMOUNT}`,
        code: "OUT_OF_RANGE",
      });
    }

    // Note (optional)
    if (payload.note && typeof payload.note === "string") {
      if (payload.note.length > LIMITS.MAX_NOTE_LENGTH) {
        errors.push({
          field: "note",
          message: `Note cannot exceed ${LIMITS.MAX_NOTE_LENGTH} characters`,
          code: "OUT_OF_RANGE",
        });
      }
    }

    // CategoryId (optional)
    if (payload.categoryId && typeof payload.categoryId !== "string") {
      errors.push({
        field: "categoryId",
        message: "Category ID must be a string",
        code: "TYPE_MISMATCH",
      });
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? (payload as Partial<Transaction>) : undefined,
      errors,
    };
  },
};

/**
 * Category validators
 */
export const categoryValidators = {
  validateCreate(data: unknown): ValidationResult<Partial<Category>> {
    const errors: ValidationError[] = [];
    const payload = data as Record<string, unknown>;

    // Name
    if (!payload.name || typeof payload.name !== "string") {
      errors.push({
        field: "name",
        message: "Name is required",
        code: "REQUIRED",
      });
    } else if (payload.name.trim().length === 0) {
      errors.push({
        field: "name",
        message: "Name cannot be empty",
        code: "INVALID_FORMAT",
      });
    } else if (payload.name.length > LIMITS.MAX_CATEGORY_NAME_LENGTH) {
      errors.push({
        field: "name",
        message: `Name cannot exceed ${LIMITS.MAX_CATEGORY_NAME_LENGTH} characters`,
        code: "OUT_OF_RANGE",
      });
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? (payload as Partial<Category>) : undefined,
      errors,
    };
  },
};

/**
 * Budget validators
 */
export const budgetValidators = {
  validateSet(data: unknown): ValidationResult<Partial<MonthlyBudget>> {
    const errors: ValidationError[] = [];
    const payload = data as Record<string, unknown>;

    // Month
    if (!payload.month || typeof payload.month !== "string") {
      errors.push({
        field: "month",
        message: "Month is required (format: YYYY-MM)",
        code: "REQUIRED",
      });
    } else if (!/^\d{4}-\d{2}$/.test(payload.month)) {
      errors.push({
        field: "month",
        message: "Month must be in YYYY-MM format",
        code: "INVALID_FORMAT",
      });
    }

    // Amount
    if (payload.amount === undefined || payload.amount === null) {
      errors.push({
        field: "amount",
        message: "Budget amount is required",
        code: "REQUIRED",
      });
    } else if (typeof payload.amount !== "number") {
      errors.push({
        field: "amount",
        message: "Budget amount must be a number",
        code: "TYPE_MISMATCH",
      });
    } else if (payload.amount < 0) {
      errors.push({
        field: "amount",
        message: "Budget amount cannot be negative",
        code: "OUT_OF_RANGE",
      });
    } else if (payload.amount > LIMITS.MAX_TRANSACTION_AMOUNT) {
      errors.push({
        field: "amount",
        message: `Budget cannot exceed ${LIMITS.MAX_TRANSACTION_AMOUNT}`,
        code: "OUT_OF_RANGE",
      });
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? (payload as Partial<MonthlyBudget>) : undefined,
      errors,
    };
  },
};

/**
 * Goal validators
 */
export const goalValidators = {
  validateCreate(data: unknown): ValidationResult<Partial<Goal>> {
    const errors: ValidationError[] = [];
    const payload = data as Record<string, unknown>;

    // Title
    if (!payload.title || typeof payload.title !== "string") {
      errors.push({
        field: "title",
        message: "Goal title is required",
        code: "REQUIRED",
      });
    } else if (payload.title.trim().length === 0) {
      errors.push({
        field: "title",
        message: "Goal title cannot be empty",
        code: "INVALID_FORMAT",
      });
    }

    // Target amount
    if (!payload.targetAmount || typeof payload.targetAmount !== "number") {
      errors.push({
        field: "targetAmount",
        message: "Target amount is required and must be a number",
        code: "REQUIRED",
      });
    } else if (payload.targetAmount < LIMITS.MIN_GOAL_AMOUNT) {
      errors.push({
        field: "targetAmount",
        message: `Minimum target is ${LIMITS.MIN_GOAL_AMOUNT}`,
        code: "OUT_OF_RANGE",
      });
    } else if (payload.targetAmount > LIMITS.MAX_GOAL_AMOUNT) {
      errors.push({
        field: "targetAmount",
        message: `Maximum target is ${LIMITS.MAX_GOAL_AMOUNT}`,
        code: "OUT_OF_RANGE",
      });
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? (payload as Partial<Goal>) : undefined,
      errors,
    };
  },
};

/**
 * Settings validators
 */
export const settingsValidators = {
  validateUpdate(data: unknown): ValidationResult<Partial<AppSettings>> {
    const errors: ValidationError[] = [];
    const payload = data as Record<string, unknown>;

    // Currency
    if (payload.defaultCurrency && typeof payload.defaultCurrency !== "string") {
      errors.push({
        field: "defaultCurrency",
        message: "Currency must be a string",
        code: "TYPE_MISMATCH",
      });
    }

    // Locale
    if (payload.locale && typeof payload.locale !== "string") {
      errors.push({
        field: "locale",
        message: "Locale must be a string",
        code: "TYPE_MISMATCH",
      });
    }

    return {
      valid: errors.length === 0,
      data: errors.length === 0 ? (payload as Partial<AppSettings>) : undefined,
      errors,
    };
  },
};

/**
 * Validators export object for easy access
 */
export const Validators = {
  transaction: transactionValidators,
  category: categoryValidators,
  budget: budgetValidators,
  goal: goalValidators,
  settings: settingsValidators,
};
