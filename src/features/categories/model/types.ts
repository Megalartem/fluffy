export type CategoryType = "expense" | "income" | "both";

export interface Category {
  id: string;               // uuid
  workspaceId: string;

  name: string;
  type: CategoryType;      // "expense" | "income" | "both"
  iconKey: string;          // "shopping_cart" / "coffee" — ключ, а не компонент
  colorKey: string;         // из твоих 20 токенов: "violet" | "steel" | ...

  order: number;            // для сортировки списка
  isArchived: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type CreateCategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt" | "isArchived">;
export type UpdateCategoryPatch = Partial<Pick<Category, "name" | "iconKey" | "colorKey" | "order" | "isArchived">>;
