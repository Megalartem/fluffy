
import { ListRowBase } from "@/shared/ui/molecules";
import type { Goal } from "@/features/goals/model/types";
import { GoalProgressRing, Text } from "@/shared/ui/atoms";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";
import styles from "./GoalItem.module.css";
import { GoalStatusBadge } from "../GoalStatusBadge";

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
  trailing,
  size = "m",
  direction = "row",
  onClick,
}: GoalItemProps) {
  const progress = clamp01(goal.currentAmountMinor / goal.targetAmountMinor);
  const label = `${Math.round(progress * 100)}%`;


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
            <Text variant="body">
              {fromMinorByCurrency(goal.currentAmountMinor, goal.currency)}
              {" / "}
              {fromMinorByCurrency(goal.targetAmountMinor, goal.currency)}
            </Text>
            {subtitle && size !== "m" && (
              <Text variant="caption">{subtitle}</Text>
            )}
          </div>
        }
        trailing={trailing}
        size={size === "m" ? "m" : "l"}
        tone={STATUS_TONE_MAP[goal.status]}
        onClick={onClick}
        className={direction === "column" ? styles.column : undefined}
        ariaLabel={`Open goal: ${goal.name}`}
      />
    </div>
  );
}

GoalItem.displayName = "GoalItem";