"use client";

import React from "react";
import clsx from "clsx";
import { ListRowBase } from "@/shared/ui/molecules";
import { Badge, ProgressRing, Text } from "@/shared/ui/atoms";
import { shownAmount } from "@/shared/lib/money/helper";
import {
    getTotalBudgetProgress,
    getTotalBudgetRemaining,
} from "@/features/budgets/model/utils";
import type { TotalBudgetSummary } from "@/features/budgets/model/types";
import type { CurrencyCode } from "@/shared/di/types";
import styles from "./TotalBudgetCard.module.css";

export interface TotalBudgetCardProps {
    summary: TotalBudgetSummary;
    currency: CurrencyCode;
    className?: string;
}

type BudgetState = "normal" | "warning" | "over";

function getBudgetState(progress: number): BudgetState {
    if (progress >= 1) return "over";
    if (progress >= 0.8) return "warning";
    return "normal";
}

export function TotalBudgetCard({ summary, currency, className }: TotalBudgetCardProps) {
    const rawProgress = getTotalBudgetProgress(summary);
    const remaining = getTotalBudgetRemaining(summary);
    const state = getBudgetState(rawProgress);
    const progressPct = Math.min(100, Math.round(rawProgress * 100));
    const isOver = state === "over";

    return (
        <div className={clsx(styles.wrapper, className)}>
            <Badge className={clsx(styles.badge)}>
                {progressPct}% Used
            </Badge>
            <ListRowBase
                className={styles.column}
                size="l"
                leading={
                    <ProgressRing
                        value={rawProgress}
                        size="xxl"
                        label={`${progressPct}%`}
                        ariaLabel={`Total budget usage: ${progressPct}%`}
                    />
                }
                title={
                    <div className={styles.amounts}>
                        <Text variant="body">
                            {shownAmount(summary.totalSpentMinor, currency)}
                        </Text>
                        <Text variant="muted">{" / "}</Text>
                        <Text variant="muted">
                            {shownAmount(summary.totalLimitMinor, currency)}
                        </Text>
                    </div>
                }
                subtitle={
                    <div className={styles.meta}>
                        <Text variant="caption">Remaining{" "}</Text>
                        <Text variant="caption" className={clsx(styles.metaValue, isOver && styles.overText)}>
                            {isOver
                                ? `Over by ${shownAmount(-remaining, currency)}`
                                : shownAmount(remaining, currency)}
                        </Text>
                        {summary.unbudgetedMinor > 0 && (
                            <>
                                <Text variant="caption" className={styles.dot}>{"·"}</Text>
                                <Text variant="caption">{"Unbudgeted "}</Text>
                                <Text variant="caption" className={styles.metaValue}>
                                    {shownAmount(summary.unbudgetedMinor, currency)}
                                </Text>
                            </>
                        )}
                    </div>
                }
            />
        </div>
    );
}

TotalBudgetCard.displayName = "TotalBudgetCard";
