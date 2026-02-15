import React from "react";
import styles from "./TransactionCategoryIcon.module.css";
import { CategoryIcon } from "@/shared/ui/atoms";
import { ArrowDown, ArrowUp, ArrowRight, Target } from "lucide-react";
import { CategoryColor } from "@/features/categories/model/types";

type TxCategoryIconSize = "s" | "m" | "l";
export type TxType = "expense" | "income" | "transfer";

export type TransactionCategoryIconProps = React.HTMLAttributes<HTMLDivElement> & {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    size?: TxCategoryIconSize;
    color?: CategoryColor;
    txType?: TxType;
    linkedGoalId?: string | null;
};

const TxBadgeIcon = ({ txType }: { txType: TxType }) => {
    switch (txType) {
        case "expense":
            return ArrowDown;
        case "income":
            return ArrowUp;
        case "transfer":
            return ArrowRight;
        default:
            return ArrowDown;
    }
};

export function TransactionCategoryIcon({
    icon,
    size = "m",
    color = "default",
    txType = "expense",
    linkedGoalId,
    className,
    ...rest
}: TransactionCategoryIconProps) {
    // Use Target icon for goal-linked transactions
    const displayIcon = linkedGoalId ? Target : icon;
    const displayColor = linkedGoalId ? "green" : color;

    return (
        <div
            className={[styles.wrap, className].filter(Boolean).join(" ")}
            data-size={size}
        >
            <CategoryIcon
                {...rest}
                icon={displayIcon}
                size={size}
                color={displayColor}
                importance={"secondary"}
                className={styles.root}
            />

            <span className={styles.badge} aria-hidden="true" data-type={txType}>
                <CategoryIcon
                    icon={TxBadgeIcon({ txType })}
                    size={["s", "m"].includes(size) ? "xs" : "s"}
                    color={"tx-type"}
                    importance="secondary"
                    className={txType === 'income' ? styles.badgeIconIncome : ""}
                />
            </span>
        </div>
    );
}

TransactionCategoryIcon.displayName = "TransactionCategoryIcon";