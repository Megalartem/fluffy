import type { AppSettings } from "../model/types";

export interface SettingsRepo {
  get(workspaceId: string): Promise<AppSettings>;
  update(workspaceId: string, patch: Partial<Pick<AppSettings, "defaultCurrency" | "locale">>): Promise<AppSettings>;
}
