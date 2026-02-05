import type { CategoryType } from "@/features/categories/model/types";

export type CategoriesFilterType = "all" | CategoryType;

export type CategoriesFilterValues = {
  query: string;
  type: CategoriesFilterType;
  showArchived: boolean;
};
