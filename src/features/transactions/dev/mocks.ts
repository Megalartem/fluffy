import type { Category } from "@/features/categories/model/types";
import type { Transaction } from "@/features/transactions/model/types";
import type { IOptionBase } from "@/shared/ui/atoms";
import { db, ensureDbInitialized } from "@/shared/lib/storage/db";

export const MOCK_WORKSPACE_ID = "ws_local";
export const MOCK_CURRENCY = "USD";
export const MOCK_DEFAULT_CATEGORY = "cat_food";

export const mockCategories: Category[] = [
  {
    id: "cat_food",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Food & coffee",
    type: "expense",
    iconKey: "coffee",
    colorKey: "amber",
    isArchived: false,
    order: 10,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "cat_transport",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Transport",
    type: "expense",
    iconKey: "car",
    colorKey: "blue",
    isArchived: false,
    order: 20,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "cat_home",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Home",
    type: "expense",
    iconKey: "home",
    colorKey: "plum",
    isArchived: false,
    order: 30,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "cat_salary",
    workspaceId: MOCK_WORKSPACE_ID,
    name: "Salary",
    type: "income",
    iconKey: "wallet",
    colorKey: "green",
    isArchived: false,
    order: 40,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
    deletedAt: null,
  },
];

export const mockCategoryOptions: IOptionBase[] = mockCategories
  .filter((c) => !c.deletedAt)
  .map((c) => ({ value: c.id, label: c.name }));

export const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    workspaceId: MOCK_WORKSPACE_ID,
    type: "expense",
    amountMinor: 490,
    currency: MOCK_CURRENCY,
    dateKey: "2026-01-15",
    categoryId: "cat_food",
    note: "Coffee",
    createdAt: "2026-01-15T08:12:00.000Z",
    updatedAt: "2026-01-15T08:12:00.000Z",
    deletedAt: null,
  },
  {
    id: "tx_002",
    workspaceId: MOCK_WORKSPACE_ID,
    type: "expense",
    amountMinor: 1250,
    currency: MOCK_CURRENCY,
    dateKey: "2026-01-15",
    categoryId: "cat_transport",
    note: "Grab",
    createdAt: "2026-01-15T10:05:00.000Z",
    updatedAt: "2026-01-15T10:05:00.000Z",
    deletedAt: null,
  },
  {
    id: "tx_003",
    workspaceId: MOCK_WORKSPACE_ID,
    type: "income",
    amountMinor: 320000,
    currency: MOCK_CURRENCY,
    dateKey: "2026-01-14",
    categoryId: "cat_salary",
    note: "Part-time",
    createdAt: "2026-01-14T09:00:00.000Z",
    updatedAt: "2026-01-14T09:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "tx_004",
    workspaceId: MOCK_WORKSPACE_ID,
    type: "expense",
    amountMinor: 5600,
    currency: MOCK_CURRENCY,
    dateKey: "2026-01-13",
    categoryId: "cat_home",
    note: "Groceries",
    createdAt: "2026-01-13T18:30:00.000Z",
    updatedAt: "2026-01-13T18:30:00.000Z",
    deletedAt: null,
  },
];

export async function seedMockTransactionsIfEmpty(workspaceId = MOCK_WORKSPACE_ID) {
  await ensureDbInitialized();
  const existingCount = await db.transactions.where("workspaceId").equals(workspaceId).count();
  if (existingCount === 0) {
    await db.transactions.bulkPut(mockTransactions);
  }
}