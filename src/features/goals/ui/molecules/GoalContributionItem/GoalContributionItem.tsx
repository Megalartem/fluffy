import React, { useMemo } from "react";
import clsx from "clsx";

import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import { Text } from "@/shared/ui/atoms";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";

import type { GoalContribution } from "@/features/goals/model/types";
import styles from "./GoalContributionItem.module.css";
import { formatDate } from "@/shared/lib/formatter";

export type GoalContributionItemSize = "m" | "l";
export type GoalContributionItemTone = "default" | "muted" | "ghost";

export type GoalContributionItemProps = {
  contribution: GoalContribution;

  /** optional trailing (e.g. kebab menu) */
  trailing?: React.ReactNode;

  size?: GoalContributionItemSize;
  tone?: GoalContributionItemTone;

  onClick?: () => void;
};


export function GoalContributionItem({
  contribution,
  size = "m",
  tone = "default",
  onClick,
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
    {
      id: "edit",
      label: "Edit",
      onAction: () => {},
    },
    {
      id: "delete",
      label: "Delete",
      onAction: () => {},
      variant: "danger",
    },
   ]

  const hasNote = Boolean(contribution.note && contribution.note.trim());

  return (
    <ListRowBase
      leading={undefined}
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
        <ActionMenu
          ariaLabel="Contribution actions"
          items={actions}
          onAction={() => {}}
          triggerButtonBody={<></>}
          isOpen={isActionsMenuOpen}
          onOpenChange={setIsActionsMenuOpen}
        />
      }
      size={size}
      tone={tone}
      onClick={onClick}
      onLongPress={() => {setIsActionsMenuOpen(true)}}
      className={clsx(styles.root)}
      ariaLabel={`Open contribution: ${amountText} on ${dateText}`}
    />
  );
}

GoalContributionItem.displayName = "GoalContributionItem";