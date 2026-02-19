"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";

import { BudgetList, BudgetUpsertSheet, TotalBudgetCard } from "@/features/budgets/ui/components";
import { useBudgetSummary } from "@/features/budgets/hooks/useBudgetSummary";
import { useBudgetMutation } from "@/features/budgets/hooks/useBudgetMutation";
import { FAB } from "@/shared/ui/atoms";
import { EmptyState, PageHeader, Skeleton } from "@/shared/ui/molecules";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import type { Budget, CategoryBudgetSummary, CreateBudgetInput, UpdateBudgetInput } from "@/features/budgets/model/types";

const SKELETON_COUNT = 5;

export default function BudgetsPage() {
    const { currency } = useWorkspace();
    const { summary, loading, error, refresh } = useBudgetSummary();
    const { budgetCreate, budgetUpdate, budgetDelete } = useBudgetMutation({ refresh });

    const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
    const [currentSpentMinor, setCurrentSpentMinor] = useState<number | undefined>();
    const [isCreating, setIsCreating] = useState(false);

    const handleEdit = useCallback((item: CategoryBudgetSummary) => {
        setCurrentSpentMinor(item.spentMinor);
        setEditingBudget(item.budget);
    }, []);

    const handleCloseSheet = useCallback(() => {
        setEditingBudget(undefined);
        setCurrentSpentMinor(undefined);
        setIsCreating(false);
    }, []);

    const handleCreate = useCallback(async (input: CreateBudgetInput) => {
        await budgetCreate(input);
        handleCloseSheet();
    }, [budgetCreate, handleCloseSheet]);

    const handleUpdate = useCallback(async (input: UpdateBudgetInput) => {
        await budgetUpdate(input);
        handleCloseSheet();
    }, [budgetUpdate, handleCloseSheet]);

    const handleDelete = useCallback(async (budget: Budget) => {
        await budgetDelete(budget.id);
        handleCloseSheet();
    }, [budgetDelete, handleCloseSheet]);

    const handleCreateNew = useCallback(() => {
        setEditingBudget(undefined);
        setIsCreating(true);
    }, []);

    const isSheetOpen = isCreating || editingBudget !== undefined;

    return (
        <div className="flex flex-col h-dvh bg-bg-main p-4 gap-4 overflow-hidden">
            <PageHeader
                title="Budgets"

            />

            {error ? (
                <EmptyState
                    title="Failed to load budgets"
                    description="Try again."
                    primaryAction={{ label: "Reload", onClick: refresh }}
                />
            ) : loading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <Skeleton key={i} variant="line" width="100%" height={64} />
                    ))}
                </div>
            ) : (summary?.categoryBudgets ?? []).length === 0 ? (
                <EmptyState
                    title="No budgets yet"
                    description="Create your first budget to start tracking spending limits."
                    tone="muted"
                    primaryAction={{ label: "Create Budget", onClick: handleCreateNew }}
                />
            ) : (
                <>
                    {summary && (
                        <TotalBudgetCard summary={summary} currency={currency} />
                    )}
                    <BudgetList
                        items={summary?.categoryBudgets ?? []}
                        onItemEdit={handleEdit}
                        onItemDelete={(item) => handleDelete(item.budget)}
                    />
                </>
            )}

            <BudgetUpsertSheet
                open={isSheetOpen}
                budget={editingBudget}
                currentSpentMinor={currentSpentMinor}
                onClose={handleCloseSheet}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />

            <FAB
                aria-label="Create Budget"
                icon={Plus}
                onClick={handleCreateNew}
            />
        </div>
    );
}


