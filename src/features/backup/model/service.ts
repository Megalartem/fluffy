import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import type { BackupFileV1 } from "./types";

const APP_ID = "budget-pwa";

function safeMeta(keys: { key: string; value: string; updatedAt?: string }[]) {
  const allowed = ["budget_notified_", "goal_notified_"];
  return keys.filter((m) => allowed.some((p) => m.key.startsWith(p)));
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function normName(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function categoryKey(c: any) {
  // подстрой поле name, если у тебя оно называется иначе
  const name = normName(c.name);
  const type = String(c.type ?? "expense"); // если нет type — считаем expense по умолчанию
  return `${type}|${name}`;
}


export class BackupService {
  async exportWorkspace(workspaceId: string): Promise<BackupFileV1> {
    await ensureDbInitialized();

    const [settings, categories, transactions, budgets, goals, meta] = await Promise.all([
      db.settings.where("workspaceId").equals(workspaceId).first(),
      db.categories.where("workspaceId").equals(workspaceId).toArray(),
      db.transactions.where("workspaceId").equals(workspaceId).toArray(),
      db.budgets.where("workspaceId").equals(workspaceId).toArray(),
      db.goals.where("workspaceId").equals(workspaceId).toArray(),
      db.meta.toArray(),
    ]);

    return {
      app: APP_ID,
      schemaVersion: 1,
      exportedAt: nowIso(),
      workspaceId,
      data: {
        settings: settings ?? null,
        categories,
        transactions,
        budgets,
        goals,
        meta: safeMeta(meta.map((m) => ({ key: m.key, value: m.value, updatedAt: m.updatedAt }))),
      },
    };
  }

  async importWorkspace(
    workspaceId: string,
    file: BackupFileV1,
    mode: "replace" | "merge" = "replace"
  ) {
    await ensureDbInitialized();

    if (!file || (file as any).app !== APP_ID) throw new Error("Это не backup-файл приложения.");
    if ((file as any).schemaVersion !== 1) throw new Error("Неподдерживаемая версия backup-файла.");

    const data = (file as any).data ?? {};

    const settings = data.settings ?? null;
    const categoriesRaw = asArray<any>(data.categories);
    const transactionsRaw = asArray<any>(data.transactions);
    const budgetsRaw = asArray<any>(data.budgets);
    const goalsRaw = asArray<any>(data.goals);
    const metaRaw = safeMeta(asArray<any>(data.meta));

    await db.transaction(
      "rw",
      [db.settings, db.categories, db.transactions, db.budgets, db.goals, db.meta],
      async () => {
        if (mode === "replace") {
          await Promise.all([
            db.settings.where("workspaceId").equals(workspaceId).delete(),
            db.categories.where("workspaceId").equals(workspaceId).delete(),
            db.transactions.where("workspaceId").equals(workspaceId).delete(),
            db.budgets.where("workspaceId").equals(workspaceId).delete(),
            db.goals.where("workspaceId").equals(workspaceId).delete(),
          ]);
        }

        // settings — и в merge тоже перезаписываем (MVP)
        if (settings) {
          await db.settings.put({ ...settings, workspaceId });
        }

        // Готовим данные под текущий workspace
        let categoriesToPut = categoriesRaw.map((x) => ({ ...x, workspaceId }));
        let transactionsToPut = transactionsRaw.map((x) => ({ ...x, workspaceId }));

        // --- DEDUPE categories by (type+name) in merge mode + remap tx.categoryId ---
        if (mode === "merge") {
          const existing = await db.categories.where("workspaceId").equals(workspaceId).toArray();

          // key -> existingId (только не удалённые)
          const keyToExistingId = new Map<string, string>();
          for (const c of existing) {
            if (c.deletedAt) continue;
            const key = categoryKey(c);
            if (!keyToExistingId.has(key)) keyToExistingId.set(key, c.id);
          }

          // oldImportedId -> newId (existingId OR keptImportedId)
          const idRemap = new Map<string, string>();

          // Уникальные категории из импортируемого файла (после схлопывания)
          const uniqueImported: any[] = [];

          for (const c of categoriesToPut) {
            const key = categoryKey(c);
            const importedId = String(c.id);

            // Если в базе уже есть такая категория — маппим на неё и НЕ добавляем новую
            const existingId = keyToExistingId.get(key);
            if (existingId) {
              idRemap.set(importedId, existingId);
              continue;
            }

            // Если внутри самого файла уже была такая категория — маппим на первую из файла
            const firstInFile = uniqueImported.find((u) => categoryKey(u) === key);
            if (firstInFile) {
              idRemap.set(importedId, String(firstInFile.id));
              continue;
            }

            // Новая уникальная категория — оставляем и делаем её "истиной" для следующих дублей
            uniqueImported.push(c);
            keyToExistingId.set(key, importedId);
          }

          categoriesToPut = uniqueImported;

          // remap categoryId in transactions
          transactionsToPut = transactionsToPut.map((t) => {
            const cid = t.categoryId ? String(t.categoryId) : null;
            if (!cid) return t;
            const newId = idRemap.get(cid);
            return newId ? { ...t, categoryId: newId } : t;
          });
        }

        // bulkPut = upsert по id
        await db.categories.bulkPut(categoriesToPut);
        await db.transactions.bulkPut(transactionsToPut);
        await db.budgets.bulkPut(budgetsRaw.map((x) => ({ ...x, workspaceId })));
        await db.goals.bulkPut(goalsRaw.map((x) => ({ ...x, workspaceId })));

        // meta — только разрешённые ключи
        for (const m of metaRaw) {
          await db.meta.put({ key: m.key, value: m.value, updatedAt: nowIso() });
        }
      }
    );
  }
}
