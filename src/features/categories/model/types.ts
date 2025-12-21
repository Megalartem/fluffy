export type CategoryType = "expense" | "income" | "both";

export type Category = {
  id: string;
  workspaceId: string;
  name: string;
  type: CategoryType;
  icon?: string | null;   // optional
  color?: string | null;  // optional
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateCategoryInput = {
  name: string;
  type?: CategoryType; // default "expense"
};
