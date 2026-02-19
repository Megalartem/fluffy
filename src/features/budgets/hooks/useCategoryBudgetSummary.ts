"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { CategoryBudgetSummary } from "../model/types";
import { getBudgetSummaryService } from "@/shared/di/domain-services";

const budgetSummaryService = getBudgetSummaryService();

/**
 * Hook for a single category budget summary
 * 
 * @param categoryId - Category to get budget summary for
 */
export function useCategoryBudgetSummary(categoryId: string) {
  const { workspaceId } = useWorkspace();

  const [summary, setSummary] = React.useState<CategoryBudgetSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await budgetSummaryService.getCategoryBudgetSummary(workspaceId, categoryId);
      setSummary(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, categoryId]);

  // Reload when workspace or categoryId changes
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { summary, loading, error, refresh } as const;
}
