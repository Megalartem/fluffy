import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";

export class MetaService {
  async get(key: string): Promise<string | null> {
    await ensureDbInitialized();
    const row = await db.meta.get(key);
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await ensureDbInitialized();
    await db.meta.put({ key, value, updatedAt: nowIso() });
  }
}
