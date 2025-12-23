import type { ISettingsRepository } from "@/core/repositories";
import type { AppSettings } from "../model/types";
import { AppError } from "@/shared/errors/app-error";
import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";

export class DexieSettingsRepo implements ISettingsRepository {
  async get(workspaceId: string): Promise<AppSettings> {
    try {
      await ensureDbInitialized();

      const id = `settings_${workspaceId}`;
      const existing = await db.settings.get(id);

      if (existing) return existing;

      const created: AppSettings = {
        id,
        workspaceId,
        defaultCurrency: "VND",
        locale: "ru-RU",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      await db.settings.put(created);
      return created;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to read/create settings", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async update(
    workspaceId: string,
    patch: Partial<Pick<AppSettings, "defaultCurrency" | "locale">>
  ): Promise<AppSettings> {
    try {
      await ensureDbInitialized();

      const current = await this.get(workspaceId);
      const updated: AppSettings = {
        ...current,
        ...patch,
        updatedAt: nowIso(),
      };

      await db.settings.put(updated);
      return updated;
    } catch (e) {
      throw new AppError("STORAGE_ERROR", "Failed to update settings", {
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
