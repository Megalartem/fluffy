"use client";

import React, { useState, Suspense } from "react";
import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import type { CategoryBudgetSummary } from "@/features/budgets/model/types";
import { getBudgetProgress, getBudgetRemaining, isBudgetOverLimit, isBudgetWarning } from "@/features/budgets/model/utils";
import { Badge, Icon, ProgressRing, Text } from "@/shared/ui/atoms";
import { shownAmount } from "@/shared/lib/money/helper";
import { getLazyLucideIcon } from "@/shared/lib/renderCategoryIcon";
import styles from "./BudgetItem.module.css";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";


export function renderBudgetProgressRing(budgetSummary: CategoryBudgetSummary, size: BudgetItemSize): React.ReactNode {
    const progress = clamp01(getBudgetProgress(budgetSummary));
    const IconComponent = getLazyLucideIcon(budgetSummary.category.iconKey);

    return (
        <ProgressRing
            size={size}
            value={progress}
            color={budgetSummary.category.colorKey}
        >
            <Suspense fallback={<div />}>
                <Icon
                    icon={<IconComponent />}
                    size={size === "m" ? "m" : "l"}
                    color={budgetSummary.category.colorKey}
                />
            </Suspense>
        </ProgressRing>
    );
}

export type BudgetItemSize = "m" | "l" | "xl";
export type BudgetItemTone = "default" | "muted" | "ghost";
export type BudgetItemDirection = "row" | "column";

export type BudgetItemProps = {
    budgetSummary: CategoryBudgetSummary;

    trailing?: React.ReactNode;

    size?: BudgetItemSize;
    direction?: BudgetItemDirection;

    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

function clamp01(x: number) {
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.min(1, x));
}

function getBudgetStatusDescription(summary: CategoryBudgetSummary): string {
    if (isBudgetOverLimit(summary)) {
        return `over budget by ${shownAmount(-getBudgetRemaining(summary), summary.budget.currency)}`;
    }
    if (getBudgetRemaining(summary) === 0) {
        return "at limit";
    }
    if (isBudgetWarning(summary)) {
        return `near limit, ${shownAmount(getBudgetRemaining(summary), summary.budget.currency)} remaining`;
    }
    return `${shownAmount(getBudgetRemaining(summary), summary.budget.currency)} remaining`;
}

function getBudgetBadge(summary: CategoryBudgetSummary): { variant: "default" | "success"; label: string } | null {
    if (isBudgetOverLimit(summary)) {
        const label = `over by ${shownAmount(-getBudgetRemaining(summary), summary.budget.currency)}`;
        return { variant: "success", label: label };
    }

    if (getBudgetRemaining(summary) === 0) {
        return { variant: "default", label: "at limit" };
    }

    if (isBudgetWarning(summary)) {
        const label = `${shownAmount(getBudgetRemaining(summary), summary.budget.currency)} left`;
        return { variant: "default", label: label };
    }
    return null;
}

export function BudgetItem({
    budgetSummary,
    size = "m",
    direction = "row",
    onClick,
    onEdit,
    onDelete,
}: BudgetItemProps) {
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const { budget, category } = budgetSummary;

    const budgetBadge = getBudgetBadge(budgetSummary);

    const actions: ActionMenuItem[] = [
        {
            id: "edit",
            icon: Pencil,
            label: "Edit",
            onAction: onEdit,
        },
        {
            id: "delete",
            icon: Trash2,
            label: "Delete",
            variant: "danger",
            onAction: onDelete,
        },
    ];

    const statusDescription = getBudgetStatusDescription(budgetSummary);
    const accessibleLabel = `${category.name}: ${shownAmount(budgetSummary.spentMinor, budget.currency)} spent of ${shownAmount(budget.limitMinor, budget.currency)} limit, ${statusDescription}`;

    return (
        <div className={styles.wrapper}>
            {budgetBadge && (
                <Badge variant={budgetBadge.variant} className={styles.statusBadge} aria-hidden="true">
                    {budgetBadge.label}
                </Badge>
            )}
            <ListRowBase
                leading={
                    renderBudgetProgressRing(budgetSummary, size)
                }
                title={category.name}
                subtitle={
                    <div className={styles.subtitle}>
                        <div className={clsx(styles.amounts, direction === "column" && styles.amountsColumn)}>
                            <Text variant="body">
                                {shownAmount(budgetSummary.spentMinor, budget.currency)}
                            </Text>
                            <Text variant="caption">
                                {" / "}
                                {shownAmount(budget.limitMinor, budget.currency)}
                            </Text>
                        </div>
                    </div>
                }
                trailing={
                    <div className={styles.trailing}>
                        <ActionMenu
                            ariaLabel={`Actions for ${category.name} budget`}
                            items={actions}
                            triggerButtonBody={<></>}
                            triggerClassName={styles.actionMenuTrigger}
                            isOpen={isActionsMenuOpen}
                            onOpenChange={setIsActionsMenuOpen}
                        />
                    </div>

                }
                size={size === "m" ? "m" : "l"}
                tone="default"
                onClick={onClick}
                onLongPress={() => setIsActionsMenuOpen(true)}
                className={direction === "column" ? styles.column : undefined}
                ariaLabel={accessibleLabel}
            />
        </div>
    );
}

BudgetItem.displayName = "BudgetItem";

