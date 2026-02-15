"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Goal } from "@/features/goals/model/types";
import { goalsRepo } from "../api/repo.dexie";

type UseGoalOptions = {
  fromList?: Goal[];
};

// Simple in-memory cache for goals (performance optimization).
// IMPORTANT: we only use this cache for the *first* load. Subsequent refreshes must hit storage
// to avoid stale UI after mutations (e.g. contribution edit should update currentAmount/status).
const goalCache = new Map<string, Goal>();

function getCachedGoalOnce(goalId: string): Goal | null {
  return goalCache.get(goalId) ?? null;
}

function setCachedGoal(goal: Goal): void {
  goalCache.set(goal.id, goal);
}

export function useGoal(goalId: string | null | undefined, options: UseGoalOptions = {}) {
  const { workspaceId } = useWorkspace();

  const [item, setItem] = React.useState<Goal | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const firstLoadRef = React.useRef(true);

  React.useEffect(() => {
    // Reset when navigating between goals
    firstLoadRef.current = true;
  }, [goalId]);

  const refresh = React.useCallback(async () => {
    setError(null);

    if (!goalId) {
      setItem(null);
      return;
    }

    if (firstLoadRef.current) {
      // fast path: find in list
      const fromList = options.fromList?.find((g) => g.id === goalId) ?? null;
      if (fromList) {
        setItem(fromList);
        setCachedGoal(fromList);
        firstLoadRef.current = false;
        return;
      }

      // Cache is only allowed on the first load
      const cached = getCachedGoalOnce(goalId);
      if (cached) {
        setItem(cached);
        firstLoadRef.current = false;
        return;
      }
    }

    setLoading(true);
    try {
      const g = await goalsRepo.getById(workspaceId, goalId);
      setItem(g);
      if (g) setCachedGoal(g); // Update cache
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      firstLoadRef.current = false;
    }
  }, [goalId, options.fromList, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh } as const;
}
