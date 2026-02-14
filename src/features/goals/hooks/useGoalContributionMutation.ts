"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type {
  CreateGoalContributionInput,
  UpdateGoalContributionPatch,
} from "@/features/goals/model/types";
import { goalContributionsService } from "@/features/goals/model/contributions.service";

export function useGoalContributionMutation(params: { refresh?: () => Promise<void> | void }) {
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
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const contributionAdd = React.useCallback(
    async (input: CreateGoalContributionInput) => {
      await withState(async () => {
        await goalContributionsService.add(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const contributionUpdate = React.useCallback(
    async (id: string, patch: UpdateGoalContributionPatch) => {
      await withState(async () => {
        await goalContributionsService.update(workspaceId, id, patch);
      });
    },
    [withState, workspaceId]
  );

  const contributionDelete = React.useCallback(
    async (id: string) => {
      await withState(async () => {
        await goalContributionsService.delete(workspaceId, id);
      });
    },
    [withState, workspaceId]
  );

  return { contributionAdd, contributionUpdate, contributionDelete, loading, error } as const;
}