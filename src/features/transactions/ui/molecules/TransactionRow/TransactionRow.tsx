import React from "react";
import styles from "./TransactionRow.module.css";

import { ListRowBase } from "@/shared/ui/molecules";
import { TransactionCategoryIcon, type TxType } from "@/features/transactions/ui/atoms";
import { Amount, type CategoryColor } from "@/shared/ui/atoms";

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

function formatAmount(amount: number, currency: string, txType: TxType) {
  const sign = txType === "expense" ? "-" : txType === "income" ? "+" : "±";
  // без i18n пока — минимально предсказуемо
  return `${sign}${amount} ${currency}`;
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
        <TransactionCategoryIcon
          icon={icon}
          size={size === "l" ? "m" : "s"}
          color={categoryColor}
          txType={txType}
        />
      }
      title={title}
      subtitle={subtitle ?? undefined}
      trailing={
        <Amount
          state={txType === "expense" ? "negative" : "positive"}
        >
            {formatAmount(amount, currency, txType)}
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