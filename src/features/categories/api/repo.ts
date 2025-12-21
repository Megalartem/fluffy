import type { Category } from "../model/types";

export interface CategoriesRepo {
  list(workspaceId: string): Promise<Category[]>;
  getById(workspaceId: string, id: string): Promise<Category | null>;
  create(workspaceId: string, category: Category): Promise<Category>;
  update(workspaceId: string, id: string, patch: Partial<Category>): Promise<Category>;
  softDelete(workspaceId: string, id: string): Promise<void>;
}
