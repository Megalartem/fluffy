import { WorkspaceService } from "@/shared/config/workspace";
import type { SettingsRepo } from "../api/repo";
import type { AppSettings } from "../model/types";

export class BootstrapService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly settingsRepo: SettingsRepo
  ) {}

  async init(): Promise<{ workspaceId: string; settings: AppSettings }> {
    const workspaceId = await this.workspaceService.getCurrentWorkspaceId();
    const settings = await this.settingsRepo.get(workspaceId);
    return { workspaceId, settings };
  }
}