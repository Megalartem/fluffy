"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { DashboardService } from "@/features/dashboard/model/service";
import type { MonthlySummary } from "@/features/dashboard/model/types";
import { BudgetService } from "@/features/budgets/model/service";
import type { BudgetStatus } from "@/features/budgets/model/types";
import { GoalsService } from "@/features/goals/model/service";
import type { Goal } from "@/features/goals/model/types";
import { NotificationsService } from "@/features/notifications/model/service";
import type { Notice } from "@/features/notifications/model/types";

export type DashboardPeriod = "current" | "previous";

export function useDashboardData(period: DashboardPeriod) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();

      const [data, goalsList] = await Promise.all([
        new DashboardService().getMonthlySummary(workspaceId, period),
        new GoalsService().list(workspaceId),
      ]);

      const budgetStatus = await new BudgetService().getBudgetStatus(
        workspaceId,
        data.month
      );

      const noticeList = await new NotificationsService().getDashboardNotices({
        workspaceId,
        month: data.month,
        budget: budgetStatus,
        goals: goalsList,
      });

      setSummary(data);
      setBudget(budgetStatus);
      setGoals(goalsList);
      setNotices(noticeList);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setBudgetLimit = useCallback(
    async (limit: number) => {
      if (!summary) return;
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      await new BudgetService().setMonthlyLimit(workspaceId, summary.month, limit);
      const refreshed = await new BudgetService().getBudgetStatus(
        workspaceId,
        summary.month
      );
      setBudget(refreshed);

      // Refresh notices because budget change can affect them
      const noticeList = await new NotificationsService().getDashboardNotices({
        workspaceId,
        month: summary.month,
        budget: refreshed,
        goals,
      });
      setNotices(noticeList);
    },
    [summary, goals]
  );

  const dismissNotice = useCallback(async (n: Notice) => {
    await new NotificationsService().dismissNotice(n.dismissKey, n.dismissValue);
    setNotices((prev) => prev.filter((x) => x.id !== n.id));
  }, []);

  const addToGoal = useCallback(async (goalId: string, amount: number) => {
    const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
    await new GoalsService().addToGoal(workspaceId, goalId, amount);
    const updatedGoals = await new GoalsService().list(workspaceId);
    setGoals(updatedGoals);
  }, []);

  return {
    loading,
    summary,
    budget,
    goals,
    notices,
    reload,
    setBudgetLimit,
    dismissNotice,
    addToGoal,
  } as const;
}
