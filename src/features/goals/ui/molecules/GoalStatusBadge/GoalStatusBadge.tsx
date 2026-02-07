import React from "react";
import type { Goal } from "@/features/goals/model/types";
import { Badge } from "@/shared/ui/atoms";
import { formatDate } from "@/shared/lib/formatter";

export type GoalStatusBadgeProps = {
  goal: Goal;
  className?: string;
};

export function GoalStatusBadge({
  goal,
  className,
}: GoalStatusBadgeProps) {
  const statusBadgeVariant =
    goal.status === "completed" ? "success" as const :
    goal.status === "archived" ? "default" as const :
    undefined;

  if (statusBadgeVariant) {
    return (
      <div className={className}>
        <Badge variant={statusBadgeVariant}>
          {goal.status === "completed" ? "Completed" : "Archived"}
        </Badge>
      </div>
    );
  }

  if (goal.deadline) {
    return (
      <div className={className}>
        <Badge variant="default">{formatDate(goal.deadline)}</Badge>
      </div>
    );
  }

  return null;
}

GoalStatusBadge.displayName = "GoalStatusBadge";
