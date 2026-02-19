"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { CreateBudgetInput, UpdateBudgetInput } from "../model/types";
import { getBudgetsService } from "@/shared/di/domain-services";

const budgetsService = getBudgetsService();

/**
 * Hook for budget mutations (create, update, delete)
 */
export function useBudgetMutation(params: {
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
        throw e; // Allow UI to show toast/inline error
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const budgetCreate = React.useCallback(
    async (input: CreateBudgetInput) => {
      await withState(async () => {
        await budgetsService.create(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const budgetUpdate = React.useCallback(
    async (input: UpdateBudgetInput) => {
      await withState(async () => {
        await budgetsService.update(workspaceId, input);
      });
    },
    [withState, workspaceId]
  );

  const budgetDelete = React.useCallback(
    async (id: string) => {
      await withState(async () => {
        await budgetsService.delete(workspaceId, id);
      });
    },
    [withState, workspaceId]
  );

  return { budgetCreate, budgetUpdate, budgetDelete, loading, error } as const;
}
