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

  const base: Array<Pick<Category, "name" | "order" | "iconKey">> = [
    { name: "Еда", order: 10, iconKey: "coffee" },
    { name: "Транспорт", order: 20, iconKey: "truck" },
    { name: "Кофе", order: 30, iconKey: "coffee" },
    { name: "Дом", order: 40, iconKey: "home" },
    { name: "Подписки", order: 50, iconKey: "credit-card" },
    { name: "Здоровье", order: 60, iconKey: "heart" },
    { name: "Развлечения", order: 70, iconKey: "film" },
    { name: "Другое", order: 80, iconKey: "box" },
  ];

  const now = nowIso();
  const categories: Category[] = base.map((c) => ({
    id: makeId("cat"),
    workspaceId,
    name: c.name,
    type: "expense",
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
