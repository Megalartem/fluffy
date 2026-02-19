"use client";

import clsx from "clsx";
import { ListRowBase } from "@/shared/ui/molecules";
import { ProgressRing, Text } from "@/shared/ui/atoms";
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

    const sectionLabel = isOver
        ? `Total budget: ${shownAmount(summary.totalSpentMinor, currency)} of ${shownAmount(summary.totalLimitMinor, currency)} spent, over by ${shownAmount(-remaining, currency)}`
        : `Total budget: ${shownAmount(summary.totalSpentMinor, currency)} of ${shownAmount(summary.totalLimitMinor, currency)} spent, ${shownAmount(remaining, currency)} remaining`;

    return (
        <section aria-label={sectionLabel} className={clsx(styles.wrapper, className)}>
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
                        <Text variant="caption" className={styles.metaValue}>
                            {isOver
                                ? `Over by ${shownAmount(-remaining, currency)}`
                                : shownAmount(remaining, currency)}
                        </Text>
                        {summary.unbudgetedMinor > 0 && (
                            <>
                                <Text variant="caption" className={styles.dot} aria-hidden="true">{"·"}</Text>
                                <Text variant="caption">{"Outside budgets "}</Text>
                                <Text variant="caption" className={styles.metaValue}>
                                    {shownAmount(summary.unbudgetedMinor, currency)}
                                </Text>
                            </>
                        )}
                    </div>
                }
            />
        </section>
    );
}

TotalBudgetCard.displayName = "TotalBudgetCard";
