"use client";

import type { Goal } from "@/features/goals/model/types";

function fmt(n: number) {
    return n.toLocaleString("ru-RU");
}

export function GoalMiniCard({
    goal,
    onQuickAddClick,
    isSaving,
}: {
    goal: Goal;
    onQuickAddClick: (goal: Goal) => void;
    isSaving?: boolean;
}) {
    const progress = goal.targetAmount > 0 ? Math.min(1, goal.currentAmount / goal.targetAmount) : 0;
    const pct = Math.round(progress * 100);

    return (
        <div className="rounded-2xl border p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold truncate">{goal.title}</div>

                        <button
                            className="rounded-lg border px-2 py-1 text-sm font-semibold disabled:opacity-50"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickAddClick(goal);
                            }}
                            type="button"
                            aria-label="Пополнить цель"
                            title="Пополнить"
                            disabled={Boolean(isSaving)}
                        >
                            {isSaving ? "…" : "+"}
                        </button>
                    </div>

                    <div className="text-sm opacity-70">
                        {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)} {goal.currency} · {pct}%
                    </div>
                </div>

                {goal.deadline ? (
                    <div className="text-xs opacity-60 whitespace-nowrap">{goal.deadline}</div>
                ) : null}
            </div>

            <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                <div className="h-2 bg-black" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
