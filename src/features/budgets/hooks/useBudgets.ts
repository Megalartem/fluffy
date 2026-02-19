"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Budget } from "../model/types";
import { getBudgetsService } from "@/shared/di/domain-services";

const budgetsService = getBudgetsService();

/**
 * Hook for managing budgets list
 */
export function useBudgets() {
  const { workspaceId } = useWorkspace();

  const [budgets, setBudgets] = React.useState<Budget[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await budgetsService.list(workspaceId);
      setBudgets(list);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Load budgets on mount and workspace change
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { budgets, loading, error, refresh } as const;
}
