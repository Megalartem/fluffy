import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import type { Category } from "./types";

const seedKey = (workspaceId: string) => `seed_categories_${workspaceId}`;

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

const randomColors = () => {
  const colors: Category["colorKey"][] = [
    "default", "violet", "indigo", "blue", "cyan", "teal",
    "amber", "orange", "coral", "red",
    "green", "lime", "mint",
    "pink", "magenta", "plum",
    "slate", "steel", "graphite", "sand", "brown"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function ensureDefaultCategoriesSeeded(workspaceId: string): Promise<void> {
  await ensureDbInitialized();

  const already = await db.meta.get(seedKey(workspaceId));
  if (already) return;

  const base: Array<Pick<Category, "name" | "order" | "iconKey" | "type">> = [
    { name: "Еда", order: 10, iconKey: "coffee", type: "expense" },
    { name: "Транспорт", order: 20, iconKey: "truck", type: "expense" },
    { name: "Кофе", order: 30, iconKey: "coffee", type: "expense" },
    { name: "Дом", order: 40, iconKey: "home", type: "expense" },
    { name: "Подписки", order: 50, iconKey: "credit-card", type: "expense" },
    { name: "Здоровье", order: 60, iconKey: "heart", type: "expense" },
    { name: "Развлечения", order: 70, iconKey: "film", type: "expense" },
    { name: "Другое", order: 80, iconKey: "box", type: "expense" },
    { name: "Зарплата", order: 90, iconKey: "wallet", type: "income" },
  ];

  const now = nowIso();
  const categories: Category[] = base.map((c) => ({
    id: makeId("cat"),
    workspaceId,
    name: c.name,
    type: c.type,
    iconKey: c.iconKey,
    colorKey: randomColors(),
    isArchived: false,
    order: c.order,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }));

  await db.transaction("rw", db.categories, db.meta, async () => {
    await db.categories.bulkPut(categories);
    await db.meta.put({ key: seedKey(workspaceId), value: "1", updatedAt: nowIso() });
  });
}
