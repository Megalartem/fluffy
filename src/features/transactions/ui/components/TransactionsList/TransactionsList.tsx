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
import { dynamicIconImports, type IconName } from "lucide-react/dynamic";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";

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
    currency: string;

    /** Current sort selection; used to avoid overriding sorted data */
    sort?: TransactionsFilterValues["sort"];

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

const lazyIconCache = new Map<IconName, React.LazyExoticComponent<React.ComponentType<{ className?: string; size?: string | number }>>>();

function getLazyLucideIcon(name: IconName) {
    const cached = lazyIconCache.get(name);
    if (cached) return cached;

    const importer = dynamicIconImports[name];
    if (!importer) {
        const Fallback = () => null;
        return Fallback;
    }

    const LazyIcon = React.lazy(importer);
    lazyIconCache.set(name, LazyIcon);
    return LazyIcon;
}

/**
 * UI component for the Transactions page content area.
 * - Shows loading / error / empty states.
 * - Renders transactions grouped by day via `TransactionsDayGroups`.
 */
export function TransactionsList({
    transactions,
    categories,
    currency,
    sort,
    loading = false,
    error,
    filtersActive = false,
    onTransactionClick,
    onAddTransaction,
    onResetFilters,
    onRetry,
    empty,
    className,
}: ITransactionList) {
    const strings = React.useMemo(() => ({ ...DEFAULT_EMPTY, ...(empty ?? {}) }), [empty]);

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
            const totalText = fromMinorByCurrency(totalMinor, currency);

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
    console.log('filtersActive', filtersActive);
    console.log('transactions.length', transactions.length); 
    if (transactions.length === 0) {
        console.log('no transactions');
        if (filtersActive) {
            console.log('no transactions with active filters');
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
        console.log('no transactions at all');
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
    console.log('rendering transactions list');
    return (
        <div className={clsx(styles.root, className)}>
            {renderFlat ? (
                <Card variant="default" padding="md" bgVariant="white">
                    {transactions.map((t, idx) => {
                        const category = categoryById.get(t.categoryId ?? "");
                        if (!category) return null;

                        return (
                            <React.Fragment key={t.id}>
                                <TransactionRow
                                    title={category.name}
                                    subtitle={undefined}
                                    amount={t.amountMinor}
                                    currency={t.currency}
                                    txType={t.type}
                                    icon={getLazyLucideIcon(category.iconKey)}
                                    categoryColor={category.colorKey}
                                    onClick={() => onTransactionClick?.(t)}
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
                        title={g.title}
                        totalText={g.totalText}
                        onTransactionClick={onTransactionClick}
                    />
                ))
            )}
        </div>
    );
}

TransactionsList.displayName = "TransactionsList";