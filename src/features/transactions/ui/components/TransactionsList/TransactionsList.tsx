"use client";

import * as React from "react";
import clsx from "clsx";

import styles from "./TransactionsList.module.css";

import { EmptyState } from "@/shared/ui/molecules/EmptyState/EmptyState";
import type { Transaction } from "@/features/transactions/model/types";
import { TransactionsDayGroup } from "@/features/transactions/ui/molecules";
import { Skeleton } from "@/shared/ui/molecules";
import type { Category } from "@/features/categories/model/types";

export type TransactionListEmptyStateStrings = {
    noTransactionsTitle: string;
    noTransactionsDescription?: string;
    noTransactionsPrimaryLabel?: string;

    noResultsTitle: string;
    noResultsDescription?: string;
    noResultsPrimaryLabel?: string;

    errorTitle: string;
    errorDescription?: string;
    errorPrimaryLabel?: string;
};

const DEFAULT_EMPTY: TransactionListEmptyStateStrings = {
    noTransactionsTitle: "No transactions yet",
    noTransactionsDescription: "Add your first income or expense — it will appear here.",
    noTransactionsPrimaryLabel: "Add transaction",

    noResultsTitle: "No results",
    noResultsDescription: "Try changing filters or reset them.",
    noResultsPrimaryLabel: "Reset filters",

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

function formatMoneyFromMinor(amountMinor: number, currency: string): string {
    const amount = amountMinor / 100;
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "symbol",
        signDisplay: "auto",
        maximumFractionDigits: 2,
    }).format(amount);
}

function calcDayTotalMinor(transactions: Transaction[]): number {
    return transactions.reduce((acc, t) => {
        if (t.type === "income") return acc + t.amountMinor;  // <-- добавь return
        if (t.type === "expense") return acc - t.amountMinor; // <-- добавь return
        return acc; // transfer does not affect net total
    }, 0);
}

export type TransactionListProps = {
    transactions: Transaction[];
    categories: Category[];
    currency: string;

    loading?: boolean;
    error?: unknown;
    filtersActive?: boolean;

    onTransactionClick?: (tx: Transaction) => void;
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
    currency,
    loading = false,
    error,
    filtersActive = false,
    onTransactionClick,
    onAddTransaction,
    onResetFilters,
    onRetry,
    empty,
    className,
}: TransactionListProps) {
    const strings = React.useMemo(() => ({ ...DEFAULT_EMPTY, ...(empty ?? {}) }), [empty]);

    const dayGroups = React.useMemo<DayGroup[]>(() => {
        if (!transactions?.length) return [];

        // Ensure deterministic order inside each day (newest first)
        const sorted = [...transactions].sort((a, b) => {
            if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
            return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
        });

        const byDay = new Map<string, Transaction[]>();
        for (const t of sorted) {
            const list = byDay.get(t.dateKey);
            if (list) list.push(t);
            else byDay.set(t.dateKey, [t]);
        }

        const result: DayGroup[] = [];
        for (const [dateKey, list] of byDay.entries()) {
            const totalMinor = calcDayTotalMinor(list);
            const totalText = formatMoneyFromMinor(totalMinor, currency);

            result.push({
                dateKey,
                title: formatDayTitle(dateKey),
                totalText,
                transactions: list,
            });
        }

        // Map preserves insertion order; we inserted days in sorted order, but be explicit
        result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
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
                    title={strings.noResultsTitle}
                    description={strings.noResultsDescription}
                    tone="muted"
                    primaryAction={
                        onResetFilters
                            ? {
                                label: strings.noResultsPrimaryLabel ?? DEFAULT_EMPTY.noResultsPrimaryLabel!,
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
            {/* 123 */}
            {dayGroups.map((g) => (
                <TransactionsDayGroup
                    key={g.dateKey}
                    transactions={g.transactions}
                    categories={categories}
                    title={g.title}
                    totalText={g.totalText}
                    onTransactionClick={onTransactionClick}
                />
            ))}
        </div>
    );
}

TransactionsList.displayName = "TransactionsList";