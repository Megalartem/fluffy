import React from "react";
import styles from "./TransactionsDayGroup.module.css";

import { Card } from "@/shared/ui/molecules";
import { Amount, Divider } from "@/shared/ui/atoms";
import { SectionHeader } from "@/shared/ui/molecules";

import { TransactionRow } from "@/features/transactions/ui/molecules";
import { Transaction } from "@/features/transactions/model/types";
import { Category } from "@/features/categories/model/types";
import { dynamicIconImports, IconName } from "lucide-react/dynamic";
import { Circle } from "lucide-react";

export type ITransactionsDayGroup = {
    title: string;      // "Saturday, 21 June"
    totalText: string;  // "$272.5" (готовая строка)
    transactions: Transaction[];
    categories: Category[];

    onHeaderClick?: () => void;
    onTransactionClick?: (tx: Transaction) => void;
    className?: string;
};

const lazyIconCache = new Map<IconName, React.LazyExoticComponent<React.ComponentType<{ className?: string; size?: string | number }>>>();

function getLazyLucideIcon(name: IconName) {
    const cached = lazyIconCache.get(name);
    if (cached) return cached;

    const importer = dynamicIconImports[name];
    if (!importer) {
        console.warn(`[TransactionsDayGroup] Unknown iconKey: ${String(name)}`);
        const Fallback = () => null;
        return Fallback;
    }

    const LazyIcon = React.lazy(importer);
    lazyIconCache.set(name, LazyIcon);
    return LazyIcon;
}


export function TransactionsDayGroup({
    title,
    totalText,
    transactions,
    categories,
    onHeaderClick,
    onTransactionClick,
    className,
}: ITransactionsDayGroup) {

    const categoryById = React.useMemo(() => {
        const m = new Map<string, Category>();
        for (const c of categories) m.set(c.id, c);
        return m;
    }, [categories]);

    return (
        <Card
            variant="default"
            padding="m"
            bgVariant="white"
            className={className}
            onClick={onHeaderClick}
        >
            <SectionHeader
                title={title}
                headerText="primary"
                rightSec={
                    <Amount
                        state="neutral"
                        className={styles.total}
                    >{totalText}</Amount>
                }
            />
            <div className={styles.list}>
                {transactions.map((t, idx) => {
                    const category = categoryById.get(t.categoryId ?? "");
                    const title = category?.name ?? "Unknown category";
                    const icon = category ? getLazyLucideIcon(category.iconKey) : Circle;
                    const categoryColor = category?.colorKey ?? "default";

                    if (!category) {
                        console.warn(`Category with id=${t.categoryId} not found for transaction id=${t.id}`);
                    }

                    return (
                        <React.Fragment key={t.id}>
                            <TransactionRow
                                title={title}
                                subtitle={undefined}
                                amount={t.amountMinor}
                                currency={t.currency}
                                txType={t.type}
                                icon={icon}
                                categoryColor={categoryColor}
                                onClick={() => onTransactionClick?.(t)}
                                tone="ghost"
                                size="m"
                            />

                            {idx < transactions.length - 1 ? (
                                <Divider className={styles.divider} />
                            ) : null}
                        </React.Fragment>
                    );
                })}
            </div>
        </Card>
    );
}

TransactionsDayGroup.displayName = "TransactionsDayGroup";