import React, { Suspense, useState } from "react";

import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import { TransactionCategoryIcon } from "@/features/transactions/ui/atoms";
import { Amount, Icon, Text } from "@/shared/ui/atoms";
import { Category } from "@/features/categories/model/types";
import { Goal } from "@/features/goals/model/types";
import { useGoal } from "@/features/goals/hooks";
import { Circle, Pencil, Trash2 } from "lucide-react";
import { shownAmount } from "@/shared/lib/money/helper";
import { Transaction } from "@/features/transactions/model/types";
import { dynamicIconImports, IconName } from "lucide-react/dynamic";
import styles from "./TransactionRow.module.css";

export type TransactionRowProps = {
  transaction: Transaction;
  category: Category | undefined;
  goals?: Goal[];     // Preloaded goals for N+1 optimization
  size?: "m" | "l";
  tone?: "default" | "muted" | "ghost";

  selected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const lazyIconCache = new Map<IconName, React.LazyExoticComponent<React.ComponentType<{ className?: string; size?: string | number }>>>();

function getLazyLucideIcon(name: IconName) {
  const cached = lazyIconCache.get(name);
  if (cached) return cached;

  const importer = dynamicIconImports[name];
  if (!importer) {
    const Fallback = () => null;
    return Fallback;
  }

  const LazyIcon = React.lazy(importer);
  lazyIconCache.set(name, LazyIcon);
  return LazyIcon;
}

export function TransactionRow({
  transaction,
  category,
  goals,
  size = "m",
  tone = "default",
  onClick,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  // Load goal if transaction is linked to one (N+1 optimization via fromList)
  const { item: goal, loading: goalLoading } = useGoal(transaction.linkedGoalId ?? null, {
    fromList: goals,
  });

  // Display title: goal name if linked, otherwise category name
  const displayTitle = React.useMemo(() => {
    if (transaction.linkedGoalId) {
      if (goalLoading) {
        return "Loading...";
      }
      if (goal) {
        return `Top up: ${goal.name}`;
      }
      return "Linked to goal"; // fallback if goal not found
    }
    return category?.name ?? "Unknown category";
  }, [transaction.linkedGoalId, goal, goalLoading, category]);

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
  ]
  return (
    <ListRowBase
      leading={
        <Suspense fallback={<Icon icon={Circle} size={size === "l" ? "m" : "s"} />}>
          <TransactionCategoryIcon
            icon={category ? getLazyLucideIcon(category.iconKey) : Circle}
            size={size === "l" ? "m" : "s"}
            color={category?.colorKey ?? "default"}
            txType={transaction.type}
            linkedGoalId={transaction.linkedGoalId}
          />
        </Suspense>
      }
      title={displayTitle}
      subtitle={transaction.note ? <Text variant="caption" className={styles.note}>{transaction.note}</Text> : undefined}
      trailing={
        <>
          <Amount
            state={transaction.type === "expense" ? "negative" : "positive"}
          >
            {shownAmount(transaction.amountMinor, transaction.currency)}
          </Amount>
          <ActionMenu
            ariaLabel="Transaction actions"
            items={actions}
            onAction={() => { }}
            triggerButtonBody={<></>}
            triggerClassName={styles.triggerActionButton}
            isOpen={isActionsMenuOpen}
            onOpenChange={setIsActionsMenuOpen}
          />
        </>
      }
      size={size}
      tone={tone}
      onClick={onClick}
      onLongPress={() => setIsActionsMenuOpen(true)}
      ariaLabel={`Open transaction: ${displayTitle}`}
    />
  );
}

TransactionRow.displayName = "TransactionRow";