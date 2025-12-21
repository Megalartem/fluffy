import type { Goal } from "../model/types";

export interface GoalsRepo {
  list(workspaceId: string): Promise<Goal[]>;
  getById(workspaceId: string, id: string): Promise<Goal | null>;
  create(workspaceId: string, goal: Goal): Promise<Goal>;
  update(workspaceId: string, id: string, patch: Partial<Goal>): Promise<Goal>;
  softDelete(workspaceId: string, id: string): Promise<void>;
}
