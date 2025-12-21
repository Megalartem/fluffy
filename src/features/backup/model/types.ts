export type BackupFileV1 = {
  app: "budget-pwa";
  schemaVersion: 1;
  exportedAt: string;
  workspaceId: string;
  data: {
    settings: any | null;
    categories: any[];
    transactions: any[];
    budgets: any[];
    goals: any[];
    meta: { key: string; value: string; updatedAt?: string }[];
  };
};
