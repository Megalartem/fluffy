
import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import type { Goal } from "@/features/goals/model/types";
import { GoalProgressRing, Text } from "@/shared/ui/atoms";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";
import styles from "./GoalItem.module.css";
import { GoalStatusBadge } from "../GoalStatusBadge";
import clsx from "clsx";
import { useState } from "react";
import { Archive, Pencil, Trash2 } from "lucide-react";

export type GoalItemSize = "m" | "l" | "xl";
export type GoalItemTone = "default" | "muted" | "ghost";
export type GoalItemDirection = "row" | "column";

export type GoalItemProps = {
  goal: Goal;

  /** Optional small helper text before computed meta */
  subtitle?: string | null;

  trailing?: React.ReactNode;

  size?: GoalItemSize;
  direction?: GoalItemDirection;

  onClick?: () => void;

  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

const RING_SIZE_MAP: Record<GoalItemSize, "l" | "xl" | "xxl"> = {
  m: "l",
  l: "xl",
  xl: "xxl",
};

const STATUS_TONE_MAP: Record<Goal["status"], GoalItemTone> = {
  active: "default",
  completed: "muted",
  archived: "ghost",
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function GoalItem({
  goal,
  subtitle,
  size = "m",
  direction = "row",
  onClick,
  onEdit,
  onArchive,
  onDelete,
}: GoalItemProps) {

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const progress = clamp01(goal.currentAmountMinor / goal.targetAmountMinor);
  const label = `${Math.round(progress * 100)}%`;

  const actions: ActionMenuItem[] = [
    {
      id: "edit",
      icon: Pencil,
      label: "Edit",
      onAction: onEdit,
    },
    {
      id: "archive",
      icon: Archive,
      label: "Archive",
      onAction: onArchive,
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
    <div className={styles.wrapper}>
      <GoalStatusBadge goal={goal} className={styles.statusBadge} />
      <ListRowBase
        leading={
          <GoalProgressRing size={RING_SIZE_MAP[size]} value={progress} label={label} />
        }
        title={goal.name}
        subtitle={
          <div className={styles.subtitle}>
            <div className={clsx(styles.amounts, direction === "column" && styles.amountsColumn)}>
            <Text variant="body">
              {fromMinorByCurrency(goal.currentAmountMinor, goal.currency)}
              </Text>
              <Text variant="caption">
              {" / "}
              {fromMinorByCurrency(goal.targetAmountMinor, goal.currency)}
            </Text>
            </div>

            {subtitle && size !== "m" && (
              <Text variant="caption">{subtitle}</Text>
            )}
          </div>
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
        size={size === "m" ? "m" : "l"}
        tone={STATUS_TONE_MAP[goal.status]}
        onClick={onClick}
        onLongPress={() => setIsActionsMenuOpen(true)}
        className={direction === "column" ? styles.column : undefined}
        ariaLabel={`Open goal: ${goal.name}`}
      />
    </div>
  );
}

GoalItem.displayName = "GoalItem";