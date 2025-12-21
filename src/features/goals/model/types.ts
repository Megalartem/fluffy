export type Goal = {
  id: string;
  workspaceId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string | null; // YYYY-MM-DD
  note?: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateGoalInput = {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string | null;
  note?: string | null;
};

export type UpdateGoalPatch = Partial<
  Pick<Goal, "title" | "targetAmount" | "currentAmount" | "deadline" | "note">
>;
