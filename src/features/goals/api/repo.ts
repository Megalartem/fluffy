import type {
  CreateGoalContributionInput,
  CreateGoalInput,
  Goal,
  GoalContribution,
  GoalStatus,
  UpdateGoalContributionPatch,
  UpdateGoalPatch,
} from "../model/types";

export interface GoalsRepo {
  list(
    workspaceId: string,
    query?: { status?: GoalStatus | GoalStatus[] }
  ): Promise<Goal[]>;
  getById(workspaceId: string, id: string): Promise<Goal | null>;

  create(workspaceId: string, input: CreateGoalInput): Promise<Goal>;
  update(workspaceId: string, id: string, patch: UpdateGoalPatch): Promise<Goal>;

  softDelete(workspaceId: string, id: string): Promise<void>;
}




export interface GoalContributionsRepo {
  listByGoalId(workspaceId: string, goalId: string): Promise<GoalContribution[]>;
  listByWorkspaceId(workspaceId: string): Promise<GoalContribution[]>;
  getById(workspaceId: string, id: string): Promise<GoalContribution | null>;

  add(workspaceId: string, input: CreateGoalContributionInput): Promise<GoalContribution>;
  update(workspaceId: string, id: string, patch: UpdateGoalContributionPatch): Promise<GoalContribution>;

  softDelete(workspaceId: string, id: string): Promise<void>;
}