"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useWorkspace } from "@/shared/config/WorkspaceProvider";

import type { Goal, UpdateGoalInput } from "@/features/goals/model/types";
import { goalsRepo } from "@/features/goals/api/repo.dexie";
import { useGoalMutation } from "@/features/goals/hooks/useGoalMutation";

import { GoalUpsertSheet } from "@/features/goals/ui/components";
import { GoalItem } from "@/features/goals/ui/molecules";

import { FAB } from "@/shared/ui/atoms";
import { EmptyState } from "@/shared/ui/molecules";
import { PageHeader } from "@/shared/ui/molecules/PageHeader/PageHeader";
import { Skeleton } from "@/shared/ui/molecules";

// Constants
const SKELETON_COUNT = 5;

// Helper functions
const renderSection = (
  title: string,
  list: Goal[],
  onGoalClick: (goalId: string) => void,
  onEdit: (goal: Goal) => void,
  onArchive: (goal: Goal) => void,
  onDelete: (goal: Goal) => void
) => {
  if (!list.length) return null;
  return (
    <section className="flex flex-col gap-2">
      <div className="px-1 text-sm font-medium text-text-muted">{title}</div>
      <div className="flex flex-col gap-3">
        {list.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onClick={() => onGoalClick(goal.id)}
            onEdit={() => onEdit(goal)}
            onArchive={() => onArchive(goal)}
            onDelete={() => onDelete(goal)}
          />
        ))}
      </div>
    </section>
  );
};

export default function GoalsPage() {
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  // Track if the goals load attempt has settled (finished loading at least once)
  const [loadSettled, setLoadSettled] = useState(false);
  const prevLoading = useRef(loading);

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await goalsRepo.list(workspaceId);
      setItems(list);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // initial load + when workspace changes
  useEffect(() => {
    setLoadSettled(false);
    prevLoading.current = false;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // Mark settled only when loading transitions true -> false
  useEffect(() => {
    if (prevLoading.current && !loading) {
      setLoadSettled(true);
    }
    prevLoading.current = loading;
  }, [loading]);

  // If we already have data or error (edge cases)
  useEffect(() => {
    if (items.length > 0 || error) {
      setLoadSettled(true);
    }
  }, [items.length, error]);

  const { goalCreate, goalUpdate, goalDelete } = useGoalMutation({ refresh });

  const activeGoals = useMemo(() => items.filter((g) => g.status === "active"), [items]);
  const completedGoals = useMemo(() => items.filter((g) => g.status === "completed"), [items]);
  const archivedGoals = useMemo(() => items.filter((g) => g.status === "archived"), [items]);

  const openCreate = useCallback(() => {
    setEditingGoal(undefined);
    setGoalSheetOpen(true);
  }, []);

  const openEdit = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setGoalSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setGoalSheetOpen(false);
    setEditingGoal(undefined);
  }, []);

  const handleGoalClick = useCallback(
    (goalId: string) => {
      router.push(`/goals/${goalId}`);
    },
    [router]
  );

  const handleRetry = useCallback(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateGoal = useCallback(
    async (input: UpdateGoalInput) => {
      await goalUpdate(input.id, input.patch);
    },
    [goalUpdate]
  );

  const handleArchiveGoal = useCallback(
    async (goal: Goal) => {
      const nextStatus = goal.status === "archived" ? "active" : "archived";
      await goalUpdate(goal.id, { status: nextStatus });
    },
    [goalUpdate]
  );

  const handleDeleteGoal = useCallback(
    async (goal: Goal) => {
      await goalDelete(goal.id);
    },
    [goalDelete]
  );

  const isInitialLoading = !loadSettled && items.length === 0 && !error;

  return (
    <div className="flex min-h-screen flex-col bg-bg-main p-4">
      <PageHeader
        title="Goals"

      />

      <div className="mt-4 flex flex-col gap-6 pb-24">
        {isInitialLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <Skeleton key={i} variant="line" width="100%" height={96} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load goals"
            description="Something went wrong. Please try again."
            tone="muted"
            primaryAction={{
              label: "Retry",
              onClick: handleRetry,
            }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Create a goal to start tracking your progress."
            tone="muted"
            primaryAction={{
              label: "Create Goal",
              onClick: openCreate,
            }}
          />
        ) : (
          <>
            {renderSection("Active", activeGoals, handleGoalClick, openEdit, handleArchiveGoal, handleDeleteGoal)}
            {renderSection("Completed", completedGoals, handleGoalClick, openEdit, handleArchiveGoal, handleDeleteGoal)}
            {renderSection("Archived", archivedGoals, handleGoalClick, openEdit, handleArchiveGoal, handleDeleteGoal)}
          </>
        )}
      </div>

      <FAB label="Add Goal" onClick={openCreate} />

      <GoalUpsertSheet
        open={goalSheetOpen}
        onClose={closeSheet}
        goal={editingGoal}
        onCreate={goalCreate}
        onUpdate={handleUpdateGoal}
      />
    </div>
  );
}
