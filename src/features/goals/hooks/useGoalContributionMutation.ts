"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type {
  CreateGoalContributionInput,
  UpdateGoalContributionPatch,
} from "@/features/goals/model/types";
import { goalContributionsService } from "@/features/goals/model/contributions.service";
import { goalsService } from "@/features/goals/model/service";
import { transactionService } from "@/features/transactions/model/service";
import { UpdateTransactionPatch } from "@/features/transactions/model/types";

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
        // 1. Get the contribution to check for linked transaction
        const contribution = await goalContributionsService.getById(workspaceId, id);
        if (!contribution) return;
        
        // 2. Update the contribution
        await goalContributionsService.update(workspaceId, id, patch);
        
        // 3. If there's a linked transaction, sync the changes
        if (contribution.linkedTransactionId) {
          const txPatch: UpdateTransactionPatch = {};
          
          if (patch.amountMinor !== undefined) {
            txPatch.amountMinor = patch.amountMinor;
          }
          if (patch.dateKey !== undefined) {
            txPatch.dateKey = patch.dateKey;
          }
          if (patch.note !== undefined) {
            txPatch.note = patch.note;
          }
          
          // Only update if there are changes
          if (Object.keys(txPatch).length > 0) {
            try {
              await transactionService.updateTransaction(workspaceId, {
                id: contribution.linkedTransactionId,
                patch: txPatch,
              });
            } catch (e) {
              console.warn("Failed to sync transaction:", e);
              // Don't fail the contribution update if transaction sync fails
            }
          }
        }

        // 4. Recalculate goal progress
        const goalId = contribution.goalId;
        const allContributions = await goalContributionsService.listByGoalId(workspaceId, goalId);
        const goal = await goalsService.getById(workspaceId, goalId);
        
        if (goal) {
          const currentAmount = allContributions.reduce((sum, c) => sum + c.amountMinor, 0);
          const newStatus = goal.status === "archived" 
            ? "archived" 
            : (currentAmount >= goal.targetAmountMinor ? "completed" : "active");
          
          await goalsService.update(workspaceId, goalId, { 
            currentAmountMinor: currentAmount,
            status: newStatus,
          });
        }
      });
    },
    [withState, workspaceId]
  );

  const contributionDelete = React.useCallback(
    async (id: string) => {
      await withState(async () => {
        // 1. Get the contribution to know which goal to update
        const contribution = await goalContributionsService.getById(workspaceId, id);
        if (!contribution) return;
        
        const goalId = contribution.goalId;
        
        // 2. Delete the contribution
        await goalContributionsService.delete(workspaceId, id);
        
        // 3. Recalculate goal progress
        const allContributions = await goalContributionsService.listByGoalId(workspaceId, goalId);
        const goal = await goalsService.getById(workspaceId, goalId);
        
        if (goal) {
          const currentAmount = allContributions.reduce((sum, c) => sum + c.amountMinor, 0);
          const newStatus = goal.status === "archived" 
            ? "archived" 
            : (currentAmount >= goal.targetAmountMinor ? "completed" : "active");
          
          await goalsService.update(workspaceId, goalId, { 
            currentAmountMinor: currentAmount,
            status: newStatus,
          });
        }
      });
    },
    [withState, workspaceId]
  );

  return { contributionAdd, contributionUpdate, contributionDelete, loading, error } as const;
}
