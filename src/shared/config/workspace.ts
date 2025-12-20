export const LOCAL_WORKSPACE_ID = "ws_local";

export class WorkspaceService {
  async getCurrentWorkspaceId(): Promise<string> {
    return LOCAL_WORKSPACE_ID;
  }
}
