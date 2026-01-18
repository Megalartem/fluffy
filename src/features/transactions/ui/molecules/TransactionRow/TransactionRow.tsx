import React, { Suspense } from "react";
// import styles from "./TransactionRow.module.css";

import { ListRowBase } from "@/shared/ui/molecules";
import { TransactionCategoryIcon, type TxType } from "@/features/transactions/ui/atoms";
import { Amount, Icon } from "@/shared/ui/atoms";
import { CategoryColor } from "@/features/categories/model/types";
import { Circle } from "lucide-react";
import { fromMinorByCurrency, toMinor, toMinorByCurrency } from "@/shared/lib/money/helper";

export type TransactionRowProps = {
  title: string;
  subtitle?: string | null;

  amount: number;
  currency: string; // "₽", "₫", "USD" — как у тебя
  txType: TxType;

  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  categoryColor?: CategoryColor;

  size?: "m" | "l";
  tone?: "default" | "muted" | "ghost";

  selected?: boolean;
  onClick?: () => void;
};

function formatAmount(amount: number | string, currency: string) {
  return toMinorByCurrency(amount.toString(), currency)
}

export function TransactionRow({
  title,
  subtitle,
  amount,
  currency,
  txType,
  icon,
  categoryColor = "default",
  size = "m",
  tone = "default",
  onClick,
}: TransactionRowProps) {
  return (
    <ListRowBase
      leading={
        <Suspense fallback={<Icon icon={Circle} size={size === "l" ? "m" : "s"} />}>
          <TransactionCategoryIcon
            icon={icon}
            size={size === "l" ? "m" : "s"}
            color={categoryColor}
            txType={txType}
          />
        </Suspense>
      }
      title={title}
      subtitle={subtitle ?? undefined}
      trailing={
        <Amount
          state={txType === "expense" ? "negative" : "positive"}
        >
          {fromMinorByCurrency(amount, currency)}
        </Amount>
      }
      size={size}
      tone={tone}
      onClick={onClick}
      ariaLabel={`Открыть транзакцию: ${title}`}
    />
  );
}

TransactionRow.displayName = "TransactionRow";