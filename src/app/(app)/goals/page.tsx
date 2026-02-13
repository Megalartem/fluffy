"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { useWorkspace } from "@/shared/config/WorkspaceProvider";

import type { Goal, UpdateGoalPatch } from "@/features/goals/model/types";
import { goalsRepo } from "@/features/goals/api/repo.dexie";
import { useGoalMutation } from "@/features/goals/hooks/useGoalMutation";

import { GoalUpsertSheet } from "@/features/goals/ui/components";
import { GoalItem } from "@/features/goals/ui/molecules";

import { FAB } from "@/shared/ui/atoms";
import { ActionMenu, type ActionMenuItem } from "@/shared/ui/molecules";
import { PageHeader } from "@/shared/ui/molecules/PageHeader/PageHeader";

export default function GoalsPage() {
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  const [items, setItems] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

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
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const { goalCreate, goalUpdate, goalDelete } = useGoalMutation({ refresh });

  const activeGoals = useMemo(() => items.filter((g) => g.status === "active"), [items]);
  const completedGoals = useMemo(() => items.filter((g) => g.status === "completed"), [items]);
  const archivedGoals = useMemo(() => items.filter((g) => g.status === "archived"), [items]);

  const openCreate = () => {
    setEditingGoal(undefined);
    setGoalSheetOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalSheetOpen(true);
  };

  const closeSheet = () => {
    setGoalSheetOpen(false);
    setEditingGoal(undefined);
  };

  const patchToggleArchive = (goal: Goal): UpdateGoalPatch => {
    const next: UpdateGoalPatch = {
      status: goal.status === "archived" ? "active" : "archived",
    };
    return next;
  };

  const buildGoalActions = (goal: Goal): ActionMenuItem[] => [
    {
      id: "edit",
      label: "Edit",
      icon: Pencil,
      onAction: () => openEdit(goal),
    },
    {
      id: "archive",
      label: goal.status === "archived" ? "Unarchive" : "Archive",
      icon: Archive,
      onAction: async () => {
        await goalUpdate(goal.id, patchToggleArchive(goal));
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "danger",
      onAction: async () => {
        await goalDelete(goal.id);
      },
    },
  ];

  const renderSection = (title: string, list: Goal[]) => {
    if (!list.length) return null;
    return (
      <section className="flex flex-col gap-2">
        <div className="px-1 text-sm font-medium text-text-muted">{title}</div>
        <div className="flex flex-col gap-3">
          {list.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onClick={() => router.push(`/goals/${goal.id}`)}
              trailing={
                <ActionMenu
                  ariaLabel="Goal actions"
                  items={buildGoalActions(goal)}
                  triggerIcon={MoreVertical}
                />
              }
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-main p-4">
      <PageHeader
        title="Goals"
        right={
          <ActionMenu
            ariaLabel="Goals actions"
            items={[{ id: "create", label: "New goal", icon: Plus, onAction: openCreate }]}
            triggerIcon={MoreVertical}
          />
        }
      />

      <div className="mt-4 flex flex-col gap-6 pb-24">
        {loading ? (
          <div className="text-sm text-text-muted">Loading…</div>
        ) : error ? (
          <div className="text-sm text-text-muted">Failed to load goals</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-4">
            <div className="text-base font-medium">No goals yet</div>
            <div className="text-sm text-text-muted">Create a goal to start saving.</div>
          </div>
        ) : (
          <>
            {renderSection("Active", activeGoals)}
            {renderSection("Completed", completedGoals)}
            {renderSection("Archived", archivedGoals)}
          </>
        )}
      </div>

      <FAB label="Add Goal" onClick={openCreate} />

      <GoalUpsertSheet
        open={goalSheetOpen}
        onClose={closeSheet}
        goal={editingGoal}
        onCreate={goalCreate}
        onUpdate={async (input) => {
          await goalUpdate(input.id, input.patch);
        }}
      />
    </div>
  );
}
