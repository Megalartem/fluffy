import type { CategoryColor } from "@/features/categories/model/types";
import type { CurrencyCode } from "@/shared/di/types";

export type GoalStatus = "active" | "completed" | "archived";



export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

// В MVP палитра целей совпадает с палитрой категорий.
// В UI можно просто использовать один accent, но тип оставляем расширяемым.
export type GoalColor = CategoryColor;

export interface Goal {
  id: string; // uuid
  workspaceId: string;

  name: string;
  targetAmountMinor: number; // > 0
  currentAmountMinor: number; // >= 0
  currency: CurrencyCode; // фиксируется при создании из settings

  deadline?: string | null; // YYYY-MM-DD (ISO date)
  status: GoalStatus;

  // UI-поле (опционально): позволяет иметь разные акценты на карточках целей
  colorKey?: GoalColor | null;
  note?: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GoalContribution {
  id: string; // uuid
  workspaceId: string;

  goalId: string;
  amountMinor: number; // > 0
  currency: CurrencyCode;
  dateKey: string; // YYYY-MM-DD
  note?: string | null;

  // на будущее: связь с транзакцией
  linkedTransactionId?: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Inputs
export type CreateGoalInput = Pick<Goal, "name" | "targetAmountMinor" | "deadline" | "currentAmountMinor" | "currency" | "status" | "note">;
export type CreateGoalContributionInput =
  Pick<GoalContribution, "goalId" | "amountMinor" | "currency" | "dateKey" | "note" | "linkedTransactionId">;

export type UpdateGoalPatch = Partial<
  Pick<Goal, "name" | "targetAmountMinor" | "currentAmountMinor" | "deadline" | "status" | "colorKey" | "deletedAt" | "note">
>;

export type UpdateGoalContributionPatch = Partial<
  Pick<GoalContribution, "amountMinor" | "dateKey" | "note" | "deletedAt">
>;

export type UpdateGoalInput = { id: string; patch: UpdateGoalPatch };
export type UpdateGoalContributionInput = { id: string; patch: UpdateGoalContributionPatch };

export type ContributeToGoalInput = {
  goalId: string;
  amountMinor: number;
  dateKey?: string;
  note?: string | null;
};

export type SoftDeleteGoalContributionInput = { id: string };
