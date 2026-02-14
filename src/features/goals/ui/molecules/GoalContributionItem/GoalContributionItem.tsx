import React, { useMemo } from "react";
import clsx from "clsx";

import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import { Text } from "@/shared/ui/atoms";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";

import type { GoalContribution } from "@/features/goals/model/types";
import styles from "./GoalContributionItem.module.css";
import { formatDate } from "@/shared/lib/formatter";
import { Pencil, Trash2 } from "lucide-react";

export type GoalContributionItemSize = "m" | "l";
export type GoalContributionItemTone = "default" | "muted" | "ghost";

export type GoalContributionItemProps = {
  contribution: GoalContribution;

  /** optional trailing (e.g. kebab menu) */
  trailing?: React.ReactNode;

  size?: GoalContributionItemSize;
  tone?: GoalContributionItemTone;

  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};


export function GoalContributionItem({
  contribution,
  size = "m",
  tone = "default",
  onClick,
  onDelete,
  onEdit,
}: GoalContributionItemProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = React.useState(false);

  const amountText = useMemo(() => {
    const val = fromMinorByCurrency(contribution.amountMinor, contribution.currency);
    return `+ ${val}`;
  }, [contribution.amountMinor, contribution.currency]);

  const dateText = useMemo(() => {
    return formatDate(contribution.dateKey);
  }, [contribution.dateKey]);

   const actions: ActionMenuItem[] = [
    onEdit && {
      id: "edit",
      icon: Pencil,
      label: "Edit",
      onAction: onEdit,
    },
    onDelete && {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onAction: onDelete,
      variant: "danger",
    },
   ].filter(Boolean) as ActionMenuItem[];

  const hasNote = Boolean(contribution.note && contribution.note.trim());
  const hasActions = actions.length > 0;

  return (
    <ListRowBase
      title={
        <div className={styles.titleRow}>
          <Text variant={"body"} className={styles.amount}>
            {amountText}
          </Text>
          <Text variant={"muted"} className={styles.date}>
            {dateText}
          </Text>
        </div>
      }
      subtitle={
        hasNote ? (
          <Text variant="caption" className={styles.note}>
            {contribution.note!.trim()}
          </Text>
        ) : undefined
      }
      trailing={
        hasActions ? (
          <ActionMenu
            ariaLabel="Contribution actions"
            items={actions}
            onAction={() => {}}
            triggerButtonBody={<></>}
            triggerClassName={styles.actionMenuTrigger}
            isOpen={isActionsMenuOpen}
            onOpenChange={setIsActionsMenuOpen}
          />
        ) : undefined
      }
      size={size}
      tone={tone}
      onClick={onClick}
      onLongPress={hasActions ? () => {setIsActionsMenuOpen(true)} : undefined}
      className={clsx(styles.root)}
      ariaLabel={`Open contribution: ${amountText} on ${dateText}`}
    />
  );
}

GoalContributionItem.displayName = "GoalContributionItem";