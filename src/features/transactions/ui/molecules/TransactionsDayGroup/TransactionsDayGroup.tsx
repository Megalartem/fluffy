import React from "react";
import styles from "./TransactionsDayGroup.module.css";

import { Card } from "@/shared/ui/molecules";
import { Amount, Divider } from "@/shared/ui/atoms";
import { SectionHeader } from "@/shared/ui/molecules";

import { TransactionRow } from "@/features/transactions/ui/molecules";
import type { TxType } from "@/features/transactions/ui/atoms";
import type { CategoryColor } from "@/shared/ui/atoms";

export type TransactionsDayGroupItem = {
    id: string;
    title: string;
    subtitle?: string | null;

    amount: number;
    currency: string;
    txType: TxType;

    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    categoryColor?: CategoryColor;

    onClick?: () => void;
};

export type TransactionsDayGroupProps = {
    title: string;      // "Saturday, 21 June"
    totalText: string;  // "$272.5" (готовая строка)
    items: TransactionsDayGroupItem[];

    onHeaderClick?: () => void; // опционально
    className?: string;
};

export function TransactionsDayGroup({
    title,
    totalText,
    items,
    onHeaderClick,
    className,
}: TransactionsDayGroupProps) {
    return (
        <Card
            variant="default"
            padding="md"
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
                {items.map((t, idx) => (
                    <React.Fragment key={t.id}>
                        <TransactionRow
                            title={t.title}
                            subtitle={t.subtitle ?? undefined}
                            amount={t.amount}
                            currency={t.currency}
                            txType={t.txType}
                            icon={t.icon}
                            categoryColor={t.categoryColor}
                            onClick={t.onClick}
                            tone="ghost"
                            size="m"
                        />

                        {idx < items.length - 1 ? (
                            <Divider className={styles.divider} />
                        ) : null}
                    </React.Fragment>
                ))}
            </div>
        </Card>
    );
}

TransactionsDayGroup.displayName = "TransactionsDayGroup";