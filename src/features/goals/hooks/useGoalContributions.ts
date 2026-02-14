"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { GoalContribution } from "@/features/goals/model/types";
import { goalContributionsService } from "@/features/goals/model/contributions.service";

type UseGoalContributionsOptions = {
  fromList?: GoalContribution[];
  sort?: "date_desc" | "date_asc";
};

export function useGoalContributions(
  goalId: string | null | undefined,
  options: UseGoalContributionsOptions = {}
) {
  const { workspaceId } = useWorkspace();

  const [items, setItems] = React.useState<GoalContribution[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    setError(null);

    if (!goalId) {
      setItems([]);
      return;
    }

    if (options.fromList) {
      const list = options.fromList.filter((c) => c.goalId === goalId && !c.deletedAt);
      setItems(sort(list, options.sort));
      return;
    }

    setLoading(true);
    try {
      const list = await goalContributionsService.listByGoalId(workspaceId, goalId);
      setItems(sort(list, options.sort));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [goalId, options.fromList, options.sort, workspaceId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh } as const;
}

function sort(list: GoalContribution[], mode?: UseGoalContributionsOptions["sort"]) {
  const arr = [...list];
  const m = mode ?? "date_desc";
  arr.sort((a, b) => {
    const cmp = (a.dateKey ?? "").localeCompare(b.dateKey ?? "");
    return m === "date_asc" ? cmp : -cmp;
  });
  return arr;
}