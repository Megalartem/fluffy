import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import type { Category } from "./types";

const seedKey = (workspaceId: string) => `seed_categories_${workspaceId}`;

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function ensureDefaultCategoriesSeeded(workspaceId: string): Promise<void> {
  await ensureDbInitialized();

  const already = await db.meta.get(seedKey(workspaceId));
  if (already) return;

  const base: Array<Pick<Category, "name" | "order">> = [
    { name: "Еда", order: 10 },
    { name: "Транспорт", order: 20 },
    { name: "Кофе", order: 30 },
    { name: "Дом", order: 40 },
    { name: "Подписки", order: 50 },
    { name: "Здоровье", order: 60 },
    { name: "Развлечения", order: 70 },
    { name: "Другое", order: 80 },
  ];

  const now = nowIso();
  const categories: Category[] = base.map((c) => ({
    id: makeId("cat"),
    workspaceId,
    name: c.name,
    type: "expense",
    icon: null,
    color: null,
    isDefault: true,
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
