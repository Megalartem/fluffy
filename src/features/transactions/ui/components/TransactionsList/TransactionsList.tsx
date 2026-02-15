"use client";

import * as React from "react";
import clsx from "clsx";

import styles from "./TransactionsList.module.css";

import { EmptyState } from "@/shared/ui/molecules/EmptyState/EmptyState";
import type { Transaction, TransactionsFilterValues } from "@/features/transactions/model/types";
import { TransactionsDayGroup } from "@/features/transactions/ui/molecules";
import { Skeleton } from "@/shared/ui/molecules";
import type { Category } from "@/features/categories/model/types";
import { Card } from "@/shared/ui/molecules";
import { Divider } from "@/shared/ui/atoms";
import { TransactionRow } from "@/features/transactions/ui/molecules";
import { shownAmount } from "@/shared/lib/money/helper";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import { useGoals } from "@/features/goals/hooks";

export type TransactionListEmptyStateStrings = {
    noTransactionsTitle: string;
    noTransactionsDescription?: string;
    noTransactionsPrimaryLabel?: string;

    noFilterResultsTitle?: string;
    noFilterResultsDescription?: string;
    noFilterResultsPrimaryLabel?: string;
    

    errorTitle: string;
    errorDescription?: string;
    errorPrimaryLabel?: string;
};

const DEFAULT_EMPTY: TransactionListEmptyStateStrings = {
    noTransactionsTitle: "No transactions yet",
    noTransactionsDescription: "Add your first income or expense — it will appear here.",
    noTransactionsPrimaryLabel: "Add transaction",

    noFilterResultsTitle: "No results",
    noFilterResultsDescription: "Try changing filters or reset them.",
    noFilterResultsPrimaryLabel: "Reset filters",

    errorTitle: "Something went wrong",
    errorDescription: "Try again.",
    errorPrimaryLabel: "Reload",
};

type DayGroup = {
    dateKey: string;
    title: string;
    totalText: string;
    transactions: Transaction[];
};

function parseDateKey(dateKey: string): Date {
    // dateKey is YYYY-MM-DD; parse components and use local time
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function toDateKey(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatDayTitle(dateKey: string): string {
    const d = parseDateKey(dateKey);
    const todayKey = toDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    if (dateKey === todayKey) return "Today";
    if (dateKey === yesterdayKey) return "Yesterday";

    // Example: Mon, Jan 15
    return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "2-digit",
    }).format(d);
}

function calcDayTotalMinor(transactions: Transaction[]): number {
    return transactions.reduce((acc, t) => {
        if (t.type === "income") return acc + t.amountMinor;  // <-- добавь return
        if (t.type === "expense") return acc - t.amountMinor; // <-- добавь return
        return acc; // transfer does not affect net total
    }, 0);
}

export type ITransactionList = {
    transactions: Transaction[];
    categories: Category[];

    /** Current sort selection; used to avoid overriding sorted data */
    sort?: TransactionsFilterValues["sort"];

    loading?: boolean;
    error?: unknown;
    filtersActive?: boolean;

    /** Pagination - infinite scroll */
    hasMore?: boolean;
    onLoadMore?: () => void;

    onTransactionClick?: (tx: Transaction) => void;
    onTransactionDelete?: (tx: Transaction) => void;
    onAddTransaction?: () => void;
    onResetFilters?: () => void;
    onRetry?: () => void;

    empty?: Partial<TransactionListEmptyStateStrings>;
    className?: string;
};

/**
 * UI component for the Transactions page content area.
 * - Shows loading / error / empty states.
 * - Renders transactions grouped by day via `TransactionsDayGroups`.
 */
export function TransactionsList({
    transactions,
    categories,
    sort,
    loading = false,
    error,
    filtersActive = false,
    hasMore = false,
    onLoadMore,
    onTransactionClick,
    onTransactionDelete,
    onAddTransaction,
    onResetFilters,
    onRetry,
    empty,
    className,
}: ITransactionList) {
    const { currency } = useWorkspace();
    const strings = React.useMemo(() => ({ ...DEFAULT_EMPTY, ...(empty ?? {}) }), [empty]);
    
    // Load goals once for all goal-linked transactions (N+1 optimization)
    const { items: goals } = useGoals({ includeArchived: true, includeCompleted: true });

    // Intersection Observer для infinite scroll
    const observerTarget = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!hasMore || !onLoadMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const target = observerTarget.current;
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [hasMore, onLoadMore, loading]);

    const categoryById = React.useMemo(() => {
        const m = new Map<string, Category>();
        for (const c of categories) m.set(c.id, c);
        return m;
    }, [categories]);

    const renderFlat = Boolean(sort?.key && sort?.direction && sort.key !== "date");

    const dayGroups = React.useMemo<DayGroup[]>(() => {
        if (!transactions?.length) return [];

        // IMPORTANT: do not override the order coming from the data layer;
        // `useTransactions` already applies the selected sort.
        const byDay = new Map<string, Transaction[]>();
        for (const t of transactions) {
            const list = byDay.get(t.dateKey);
            if (list) list.push(t);
            else byDay.set(t.dateKey, [t]);
        }

        const result: DayGroup[] = [];
        for (const [dateKey, list] of byDay.entries()) {
            const totalMinor = calcDayTotalMinor(list);
            const totalText = shownAmount(totalMinor, currency);

            result.push({
                dateKey,
                title: formatDayTitle(dateKey),
                totalText,
                transactions: list,
            });
        }
        return result;
    }, [transactions, currency]);

    if (error) {
        return (
            <EmptyState
                title={strings.errorTitle}
                description={strings.errorDescription}
                tone="muted"
                primaryAction={
                    onRetry
                        ? { label: strings.errorPrimaryLabel ?? DEFAULT_EMPTY.errorPrimaryLabel!, onClick: onRetry }
                        : undefined
                }
                className={clsx(styles.root, className)}
            />
        );
    }

    if (loading) {
        return (
            <div className={clsx(styles.root, className)}>
                <Skeleton variant="line" width="100%" height={24} />
                <Skeleton variant="line" width="100%" height={24} />
                <Skeleton variant="line" width="100%" height={24} />
                <Skeleton variant="line" width="100%" height={24} />
                <Skeleton variant="line" width="100%" height={24} />
            </div>
        );
    }
    if (transactions.length === 0) {
        if (filtersActive) {
            return (
                <EmptyState
                    title={strings.noFilterResultsTitle}
                    description={strings.noFilterResultsDescription}
                    tone="muted"
                    primaryAction={
                        onResetFilters
                            ? {
                                label: strings.noFilterResultsPrimaryLabel ?? DEFAULT_EMPTY.noFilterResultsPrimaryLabel!,
                                onClick: onResetFilters,
                            }
                            : undefined
                    }
                    className={clsx(styles.root, className)}
                />
            );
        }
        return (
            <EmptyState
                title={strings.noTransactionsTitle}
                description={strings.noTransactionsDescription}
                tone="muted"
                primaryAction={
                    onAddTransaction
                        ? {
                            label: strings.noTransactionsPrimaryLabel ?? DEFAULT_EMPTY.noTransactionsPrimaryLabel!,
                            onClick: onAddTransaction,
                        }
                        : undefined
                }
                className={clsx(styles.root, className)}
            />
        );
    }
    return (
        <div className={clsx(styles.root, className)}>
            {renderFlat ? (
                <Card variant="default" padding="m" bgVariant="white">
                    {transactions.map((t, idx) => {
                        const category = categoryById.get(t.categoryId ?? "");

                        return (
                            <React.Fragment key={t.id}>
                                <TransactionRow
                                    transaction={t}
                                    category={category}
                                    goals={goals}
                                    onClick={() => onTransactionClick?.(t)}
                                    onDelete={() => onTransactionDelete?.(t)}
                                    tone="ghost"
                                    size="m"
                                />
                                {idx < transactions.length - 1 ? <Divider /> : null}
                            </React.Fragment>
                        );
                    })}
                </Card>
            ) : (
                dayGroups.map((g) => (
                    <TransactionsDayGroup
                        key={g.dateKey}
                        transactions={g.transactions}
                        categories={categories}
                        goals={goals}
                        title={g.title}
                        totalText={g.totalText}
                        onTransactionClick={onTransactionClick}
                        onTransactionDelete={onTransactionDelete}
                    />
                ))
            )}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
                <div ref={observerTarget} className={styles.infiniteScrollTrigger}>
                    {loading && (
                        <div className={styles.loadingMore}>
                            <Skeleton variant="line" width="100%" height={24} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

TransactionsList.displayName = "TransactionsList";