"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Goal } from "@/features/goals/model/types";
import { goalsRepo } from "../api/repo.dexie";

type UseGoalOptions = {
  fromList?: Goal[];
};

// Simple in-memory cache for goals (performance optimization)
const goalCache = new Map<string, { goal: Goal; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedGoal(goalId: string): Goal | null {
  const cached = goalCache.get(goalId);
  if (!cached) return null;
  
  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    goalCache.delete(goalId);
    return null;
  }
  
  return cached.goal;
}

function setCachedGoal(goal: Goal): void {
  goalCache.set(goal.id, { goal, timestamp: Date.now() });
}

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
      setCachedGoal(fromList); // Update cache
      return;
    }
    
    // Check cache
    const cached = getCachedGoal(goalId);
    if (cached) {
      setItem(cached);
      return;
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
    }
  }, [goalId, options.fromList, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh } as const;
}
