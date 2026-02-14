import type { IconName } from "lucide-react/dynamic";

export type CategoryType = "expense" | "income";

export const CATEGORY_COLOR_KEYS = [
  "default",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "amber",
  "orange",
  "coral",
  "red",
  "green",
  "lime",
  "mint",
  "pink",
  "magenta",
  "plum",
  "slate",
  "steel",
  "graphite",
  "sand",
  "brown",
  "tx-type",
] as const;

export type CategoryColor = (typeof CATEGORY_COLOR_KEYS)[number];

export const COLOR_LABELS: Partial<Record<CategoryColor, string>> = {
  default: "Default",
  "tx-type": "Tx type",

  violet: "Violet",
  indigo: "Indigo",
  blue: "Blue",
  cyan: "Cyan",
  teal: "Teal",

  amber: "Amber",
  orange: "Orange",
  coral: "Coral",
  red: "Red",

  green: "Green",
  lime: "Lime",
  mint: "Mint",

  pink: "Pink",
  magenta: "Magenta",
  plum: "Plum",

  slate: "Slate",
  steel: "Steel",
  graphite: "Graphite",
  sand: "Sand",
  brown: "Brown",
};

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