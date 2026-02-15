import React from "react";
import styles from "./TransactionsDayGroup.module.css";

import { Card } from "@/shared/ui/molecules";
import { Amount, Divider } from "@/shared/ui/atoms";
import { SectionHeader } from "@/shared/ui/molecules";

import { TransactionRow } from "@/features/transactions/ui/molecules";
import { Transaction } from "@/features/transactions/model/types";
import { Category } from "@/features/categories/model/types";
import { Goal } from "@/features/goals/model/types";

export type ITransactionsDayGroup = {
    title: string;      // "Saturday, 21 June"
    totalText: string;  // "$272.5" (готовая строка)
    transactions: Transaction[];
    categories: Category[];
    goals?: Goal[];     // Preloaded goals for N+1 optimization

    onHeaderClick?: () => void;
    onTransactionClick?: (tx: Transaction) => void;
    onTransactionDelete?: (tx: Transaction) => void;
    className?: string;
};


export function TransactionsDayGroup({
    title,
    totalText,
    transactions,
    categories,
    goals,
    onHeaderClick,
    onTransactionClick,
    onTransactionDelete,
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
                    return (
                        <React.Fragment key={t.id}>
                            <TransactionRow
                                transaction={t}
                                category={category}
                                goals={goals}
                                onClick={() => onTransactionClick?.(t)}
                                onEdit={() => onTransactionClick?.(t)}
                                onDelete={() => onTransactionDelete?.(t)}
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