import React from "react";
import styles from "./TransactionCategoryIcon.module.css";
import { CategoryIcon, type CategoryColor } from "@/shared/ui/atoms";
import { ArrowDown, ArrowUp, ArrowRight } from "lucide-react";

type TxCategoryIconSize = "s" | "m" | "l";
export type TxType = "expense" | "income" | "transfer";

export type TransactionCategoryIconProps = React.HTMLAttributes<HTMLDivElement> & {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    size?: TxCategoryIconSize;
    color?: CategoryColor;
    txType?: TxType;
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
    className,
    ...rest
}: TransactionCategoryIconProps) {
    return (
        <div
            className={[styles.wrap, className].filter(Boolean).join(" ")}
            data-size={size}
        >
            <CategoryIcon
                {...rest}
                icon={icon}
                size={size}
                color={color}
                importance={"secondary"}
                className={styles.root}
            />

            <span className={styles.badge} aria-hidden="true" data-type={txType}>
                <CategoryIcon
                    icon={TxBadgeIcon({ txType })}
                    size={["s", "m"].includes(size) ? "xs" : "s"}
                    color={"tx-type"}
                    importance="secondary"
                />
            </span>
        </div>
    );
}

TransactionCategoryIcon.displayName = "TransactionCategoryIcon";