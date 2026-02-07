"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Goal } from "@/features/goals/model/types";
import { goalsRepo } from "../api/repo.dexie";

type UseGoalOptions = {
  fromList?: Goal[];
};

export function useGoal(goalId: string | null | undefined, options: UseGoalOptions = {}) {
  const { workspaceId } = useWorkspace();

  const [item, setItem] = React.useState<Goal | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setError(null);

    if (!goalId) {
      setItem(null);
      return;
    }

    // fast path: find in list
    const fromList = options.fromList?.find((g) => g.id === goalId) ?? null;
    if (fromList) {
      setItem(fromList);
      return;
    }

    setLoading(true);
    try {
      const g = await goalsRepo.getById(workspaceId, goalId);
      setItem(g);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [goalId, options.fromList, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh } as const;
}
