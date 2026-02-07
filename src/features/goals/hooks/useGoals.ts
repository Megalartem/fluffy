"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Goal, GoalStatus } from "@/features/goals/model/types";
import { goalsRepo } from "../api/repo.dexie";

type UseGoalsOptions = {
  includeArchived?: boolean; // default: false
  includeCompleted?: boolean; // default: true
  status?: GoalStatus; // filter by specific status
};

export function useGoals(options: UseGoalsOptions = {}) {
  const { workspaceId } = useWorkspace();

  const [items, setItems] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await goalsRepo.list(workspaceId);
      
      // Apply filters
      let filtered = list;
      
      if (options.status) {
        filtered = filtered.filter((g) => g.status === options.status);
      } else {
        // Default filters when no specific status is requested
        if (!options.includeArchived) {
          filtered = filtered.filter((g) => g.status !== "archived");
        }
        if (!options.includeCompleted) {
          filtered = filtered.filter((g) => g.status !== "completed");
        }
      }
      
      setItems(filtered);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, options.includeArchived, options.includeCompleted, options.status]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh } as const;
}
