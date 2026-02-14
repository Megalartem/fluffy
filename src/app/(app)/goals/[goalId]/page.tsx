"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Archive, ArrowLeft, MoreVertical, Pencil, Trash2 } from "lucide-react";

import type { GoalContribution, GoalStatus } from "@/features/goals/model/types";
import { useGoal } from "@/features/goals/hooks/useGoal";
import { useGoalMutation } from "@/features/goals/hooks/useGoalMutation";
import { useGoalContributions } from "@/features/goals/hooks/useGoalContributions";
import { useGoalContributionMutation } from "@/features/goals/hooks/useGoalContributionMutation";

import { ContributeGoalSheet, GoalUpsertSheet } from "@/features/goals/ui/components";
import { GoalContributionItem, GoalItem } from "@/features/goals/ui/molecules";

import { FAB, IconButton } from "@/shared/ui/atoms";
import { Card } from "@/shared/ui/molecules";
import { ActionMenu, type ActionMenuItem } from "@/shared/ui/molecules";
import { PageHeader } from "@/shared/ui/molecules/PageHeader/PageHeader";

import { EmptyState } from "@/shared/ui/molecules/EmptyState/EmptyState";
import { Skeleton, SkeletonText, ConfirmDialog } from "@/shared/ui/molecules";

export default function GoalDetailsPage() {
    const router = useRouter();
    const params = useParams<{ goalId: string }>();
    const goalId = params?.goalId;

    const {
        item: goal,
        loading: goalLoading,
        error: goalError,
        refresh: refreshGoal,
    } = useGoal(goalId);

    const {
        items: contribs,
        loading: contribLoading,
        error: contribError,
        refresh: refreshContribs,
    } = useGoalContributions(goalId, { sort: "date_desc" });

    const refreshAll = React.useCallback(async () => {
        await Promise.all([refreshGoal(), refreshContribs()]);
    }, [refreshGoal, refreshContribs]);

    const {
        goalUpdate,
        goalDelete,
        goalContribute,
        goalRefresh,
    } = useGoalMutation({ refresh: refreshAll });

    const {
        contributionUpdate,
        contributionDelete,
    } = useGoalContributionMutation({ refresh: refreshAll });


    // UI state
    const [isGoalSheetOpen, setIsGoalSheetOpen] = React.useState(false);
    const [isContributionSheetOpen, setIsContributionSheetOpen] = React.useState(false);
    const [confirmGoalDeleteOpen, setConfirmGoalDeleteOpen] = React.useState(false);
    const [confirmContributionDeleteOpen, setConfirmContributionDeleteOpen] = React.useState(false);
    const [editingContribution, setEditingContribution] = React.useState<
        GoalContribution | undefined
    >(undefined);

    const toggleArchiveStatus = (status: GoalStatus): GoalStatus =>
        status === "archived" ? "active" : "archived";

    const goalActions: ActionMenuItem[] = [
        {
            id: "edit",
            icon: Pencil,
            label: "Edit",
            onAction: () => setIsGoalSheetOpen(true),
            disabled: !goal,
        },
        {
            id: "archive",
            icon: Archive,
            label: goal?.status === "archived" ? "Unarchive" : "Archive",
            onAction: async () => {
                if (!goal) return;
                await goalUpdate(goal.id, { status: toggleArchiveStatus(goal.status) });
            },
            disabled: !goal,
        },
        {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "danger",
            onAction: async () => {
                if (!goal) return;
                setConfirmGoalDeleteOpen(true);
            },
            disabled: !goal,
        },
    ];

    const title = goal?.name ?? "Goal";

    // Track if the goal load attempt has settled (finished loading at least once)
    const [goalLoadSettled, setGoalLoadSettled] = React.useState(false);
    const prevGoalLoading = React.useRef(goalLoading);

    React.useEffect(() => {
        // reset when navigating between goals
        setGoalLoadSettled(false);
        prevGoalLoading.current = false;
    }, [goalId]);

    React.useEffect(() => {
        // mark settled only when loading transitions true -> false
        if (prevGoalLoading.current && !goalLoading) {
            setGoalLoadSettled(true);
        }
        prevGoalLoading.current = goalLoading;
    }, [goalLoading]);

    // if we already have data or an error without a loading transition (edge cases)
    React.useEffect(() => {
        if (!goalId) return;
        if (goal || goalError) setGoalLoadSettled(true);
    }, [goalId, goal, goalError]);

    const isInitialLoading = !goalLoadSettled && !goal && !goalError;
    const isNotFound = goalLoadSettled && !goal;

    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <PageHeader
                title={title}
                left={<IconButton icon={ArrowLeft} variant="ghost" onClick={() => router.back()} />}
                right={goal ? <ActionMenu items={goalActions} triggerIcon={MoreVertical} /> : null}
            />

            {/* Goal summary */}
            <div style={{ minHeight: 220 }}>
                {isInitialLoading ? (
                    <Skeleton variant="block" height={220} radius={16} />
                ) : isNotFound ? (
                    <EmptyState
                        title="Goal not found"
                        description="It may have been deleted or you don't have access."
                        tone="muted"
                        size="l"
                        primaryAction={{ label: "Back to Goals", onClick: () => router.push("/goals") }}
                        secondaryAction={{ label: "Go back", onClick: () => router.back() }}
                    />
                ) : (
                    <GoalItem goal={goal!} direction="column" size="xl" />
                )}
            </div>

            {/* Contributions */}
            {isInitialLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton variant="circle" width={32} height={32} />
                            <div className="flex-1">
                                <SkeletonText lines={2} lastLineWidth="60%" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isNotFound ? (
                <EmptyState
                    title="No data"
                    description="This goal is unavailable."
                    tone="muted"
                />
            ) : contribLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton variant="circle" width={32} height={32} />
                            <div className="flex-1">
                                <SkeletonText lines={2} lastLineWidth="60%" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : contribError ? (
                <EmptyState
                    title="Failed to load contributions"
                    description="Try again."
                    tone="muted"
                    primaryAction={{ label: "Reload", onClick: () => void refreshContribs() }}
                />
            ) : contribs.length === 0 ? (
                <EmptyState
                    title="No contributions yet"
                    description="Add a top up to start tracking your progress."
                    tone="muted"
                    primaryAction={{
                        label: "Contribute",
                        onClick: () => {
                            setEditingContribution(undefined);
                            setIsContributionSheetOpen(true);
                        },
                    }}
                />
            ) : (
                <Card padding="m" bgVariant="white">

                    {contribs.map((c) => (
                        <GoalContributionItem
                            key={c.id}
                            tone="ghost"
                            contribution={c}
                            size="m"
                            onClick={() => {
                                setEditingContribution(c);
                                setIsContributionSheetOpen(true);
                            }}
                            onEdit={() => {
                                setEditingContribution(c);
                                setIsContributionSheetOpen(true);
                            }}
                            onDelete={() => {
                                setEditingContribution(c);
                                setIsContributionSheetOpen(true);
                            }}
                        />
                    ))}
                </Card>
            )}

            {/* Sheets */}
            {goal ? (
                <>
                    <GoalUpsertSheet
                        open={isGoalSheetOpen}
                        onClose={() => setIsGoalSheetOpen(false)}
                        goal={goal}
                        onCreate={async () => {
                            // create on details page is обычно не нужен
                        }}
                        onUpdate={async (input) => {
                            await goalUpdate(input.id, input.patch);
                        }}
                    />

                    <ContributeGoalSheet
                        goal={goal}
                        contribution={editingContribution}
                        open={isContributionSheetOpen}
                        onClose={() => setIsContributionSheetOpen(false)}
                        onCreate={async (input) => {
                            await goalContribute({
                                goalId: input.goalId,
                                amountMinor: input.amountMinor,
                                dateKey: input.dateKey,
                                note: input.note ?? null,
                            });
                        }}
                        onUpdate={async (input) => {
                            await contributionUpdate(input.id, input.patch);
                            await goalRefresh(goal.id);
                        }}
                        onDelete={async (input) => {
                            await contributionDelete(input.id);
                        }}
                    />
                </>
            ) : null}
            <FAB
                label="Contribute"
                onClick={() => {
                    setEditingContribution(undefined);
                    setIsContributionSheetOpen(true);
                }}
            />

            <ConfirmDialog
                open={confirmGoalDeleteOpen}
                title="Delete goal?"
                description="Are you sure you want to delete this goal? This action cannot be undone."
                confirmLabel="Yes, delete"
                cancelLabel="Cancel"
                tone="danger"
                onConfirm={async () => {
                    if (!goal) return;
                    await goalDelete(goal.id);
                    router.push("/goals");
                }}
                onCancel={() => setConfirmGoalDeleteOpen(false)}
            />

            <ConfirmDialog
                open={confirmContributionDeleteOpen}
                title="Delete contribution?"
                description="Are you sure you want to delete this contribution? This action cannot be undone."
                confirmLabel="Yes, delete"
                cancelLabel="Cancel"
                tone="danger"
                onConfirm={async () => {
                    if (!editingContribution) return;
                    await contributionDelete(editingContribution.id);
                    setEditingContribution(undefined);
                    setIsContributionSheetOpen(false);
                }}
                onCancel={() => setConfirmContributionDeleteOpen(false)}
            />
        </div>
    );
}