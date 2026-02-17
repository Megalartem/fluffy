"use client";

import React, { useState, Suspense } from "react";
import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import type { CategoryBudgetSummary } from "@/features/budgets/model/types";
import { getBudgetProgress, getBudgetRemaining, isBudgetOverLimit, isBudgetWarning } from "@/features/budgets/model/utils";
import { Badge, Icon, ProgressRing, Text } from "@/shared/ui/atoms";
import { shownAmount } from "@/shared/lib/money/helper";
import { getLazyLucideIcon } from "@/shared/lib/renderCategoryIcon";
import type { CategoryColor } from "@/features/categories/model/types";
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

function getBudgetBadge(summary: CategoryBudgetSummary): { variant: "warning" | "error"; label: string } | null {
  if (isBudgetOverLimit(summary)) {
    const percent = Math.round(getBudgetProgress(summary) * 100);
    return { variant: "error", label: `${percent}%` };
  }
  if (isBudgetWarning(summary)) {
    return { variant: "warning", label: "Near limit" };
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
      label: "Delete",
      icon: Trash2,
      onAction: onDelete,
      variant: "danger",
    },
  ];

  return (
    <div className={styles.wrapper}>
      {budgetBadge && (
        <Badge variant={budgetBadge.variant} className={styles.statusBadge}>
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
            {/* {getBudgetRemaining(budgetSummary) < 0 && (
              <Text variant="caption" className={styles.overBudget}>
                Over by {shownAmount(Math.abs(getBudgetRemaining(budgetSummary)), budget.currency)}
              </Text>
            )} */}
          </div>
        }
        trailing={
          <ActionMenu
            ariaLabel="Budget actions"
            items={actions}
            triggerButtonBody={<></>}
            triggerClassName={styles.actionMenuTrigger}
            isOpen={isActionsMenuOpen}
            onOpenChange={setIsActionsMenuOpen}
          />
        }
        size={size === "m" ? "m" : "l"}
        tone="default"
        onClick={onClick}
        onLongPress={() => setIsActionsMenuOpen(true)}
        className={direction === "column" ? styles.column : undefined}
        ariaLabel={`Open budget: ${category.name}`}
      />
    </div>
  );
}

BudgetItem.displayName = "BudgetItem";

