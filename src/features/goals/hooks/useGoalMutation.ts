"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { CreateGoalInput, UpdateGoalPatch, ContributeToGoalInput } from "@/features/goals/model/types";
import { goalsService } from "../model/service";
import { goalContributionsService } from "@/features/goals/model/contributions.service";

export function useGoalMutation(params: {
  refresh?: () => Promise<void> | void;
}) {
  const { workspaceId } = useWorkspace();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const withState = React.useCallback(
    async (fn: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        await fn();
        await params.refresh?.();
      } catch (e) {
        setError(e);
        throw e; // чтобы UI мог показать toast/inline
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const goalCreate = React.useCallback(
    async (input: CreateGoalInput) => {
      await withState(async () => {
        await goalsService.create(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const goalUpdate = React.useCallback(
    async (id: string, patch: UpdateGoalPatch) => {
      await withState(async () => {
        await goalsService.update(workspaceId, id, patch);
      });
    },
    [withState, workspaceId]
  );

  const goalDelete = React.useCallback(
    async (id: string) => {
      await withState(async () => {
        await goalsService.delete(workspaceId, id);
      });
    },
    [withState, workspaceId]
  );

  const goalContribute = React.useCallback(
    async (input: ContributeToGoalInput) => {
      await withState(async () => {
        await goalsService.contribute(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const goalRefresh = React.useCallback(async (id: string) => {
    await withState(async () => {
      const contributions = await goalContributionsService.listByGoalId(workspaceId, id);
      const goal = await goalsService.getById(workspaceId, id);
      if (!goal) return; // goal could be deleted

      const currentAmount = contributions.reduce((sum, c) => sum + c.amountMinor, 0);


      await goalsService.update(workspaceId, id, { 
        currentAmountMinor: currentAmount,
        status: goal.status === "archived" ? "archived" : (currentAmount >= goal.targetAmountMinor ? "completed" : "active"),
       });
    });
  }, [withState, workspaceId]);

  return { goalCreate, goalUpdate, goalDelete, goalContribute, goalRefresh, loading, error } as const;
}
