import { Budget } from "../model/types";


export interface BudgetsRepo {
  list(workspaceId: string): Promise<Budget[]>;
  getById(workspaceId: string, id: string): Promise<Budget | null>;
  getByCategoryId(workspaceId: string, categoryId: string): Promise<Budget | null>;
  create(workspaceId: string, budget: Budget): Promise<Budget>;
  update(workspaceId: string, id: string, patch: Partial<Budget>): Promise<Budget>;
  softDelete(workspaceId: string, id: string): Promise<void>;
}