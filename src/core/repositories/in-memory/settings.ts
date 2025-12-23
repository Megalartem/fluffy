import type { ISettingsRepository } from "@/core/repositories";
import type { AppSettings } from "@/features/settings/model/types";
import { AppError } from "@/shared/errors/app-error";

/**
 * In-Memory implementation of ISettingsRepository for testing.
 */
export class InMemorySettingsRepository implements ISettingsRepository {
  private storage = new Map<string, AppSettings>();

  async get(workspaceId: string): Promise<AppSettings> {
    const id = `settings_${workspaceId}`;
    const existing = this.storage.get(id);

    if (existing) return existing;

    const created: AppSettings = {
      id,
      workspaceId,
      defaultCurrency: "VND",
      locale: "ru-RU",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.storage.set(id, created);
    return created;
  }

  async update(
    workspaceId: string,
    patch: Partial<Pick<AppSettings, "defaultCurrency" | "locale">>
  ): Promise<AppSettings> {
    const current = await this.get(workspaceId);
    const updated: AppSettings = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const id = `settings_${workspaceId}`;
    this.storage.set(id, updated);
    return updated;
  }

  // Test utilities
  clear(): void {
    this.storage.clear();
  }

  getAll(): AppSettings[] {
    return Array.from(this.storage.values());
  }
}
