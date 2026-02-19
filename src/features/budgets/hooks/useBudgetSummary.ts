"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { TotalBudgetSummary } from "../model/types";
import { getBudgetSummaryService } from "@/shared/di/domain-services";

const budgetSummaryService = getBudgetSummaryService();

/**
 * Hook for total budget summary (overall spending vs budgets)
 * 
 * @param month - Optional month in YYYY-MM format (defaults to current month)
 */
export function useBudgetSummary(month?: string) {
  const { workspaceId } = useWorkspace();

  const [summary, setSummary] = React.useState<TotalBudgetSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await budgetSummaryService.getTotalBudgetSummary(workspaceId, month);
      setSummary(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, month]);

  // Reload when workspace or month changes
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, loading, error, refresh } as const;
}
