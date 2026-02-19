"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Category } from "@/features/categories/model/types";
import { getBudgetSummaryService } from "@/shared/di/domain-services";

const budgetSummaryService = getBudgetSummaryService();

/**
 * Hook for categories that have spending but no budget set
 */
export function useCategoriesWithoutBudget() {
  const { workspaceId } = useWorkspace();

  const [categories, setCategories] = React.useState<Array<{ category: Category; spentMinor: number }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await budgetSummaryService.getCategoriesWithoutBudget(workspaceId);
      setCategories(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Reload when workspace changes
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { categories, loading, error, refresh } as const;
}
