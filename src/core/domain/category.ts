export type CategoryType = "expense" | "income" | "both";

export type Category = {
  id: string;
  workspaceId: string;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};
