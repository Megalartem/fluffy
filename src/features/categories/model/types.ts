import { IconName } from "lucide-react/dynamic";

export type CategoryType = "expense" | "income" | "both";

export type CategoryColor =
  | "default" | "violet" | "indigo" | "blue" | "cyan" | "teal"
  | "amber" | "orange" | "coral" | "red"
  | "green" | "lime" | "mint"
  | "pink" | "magenta" | "plum"
  | "slate" | "steel" | "graphite" | "sand" | "brown" | "tx-type";

export interface Category {
  id: string;               // uuid
  workspaceId: string;

  name: string;
  type: CategoryType;
  iconKey: IconName;
  colorKey: CategoryColor;

  order: number;            // для сортировки списка
  isArchived: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CreateCategoryInput = Omit<Category, "id" | "workspaceId" | "createdAt" | "updatedAt" | "deletedAt" | "isArchived">;
export type UpdateCategoryPatch = Partial<Pick<Category, "name" | "iconKey" | "colorKey" | "order" | "isArchived" | "type" | "deletedAt">>;
export type UpdateCategoryInput = { id: string; patch: UpdateCategoryPatch; };