import React, { Suspense } from "react";

import { ListRowBase } from "@/shared/ui/molecules";
import { TransactionCategoryIcon, type TxType } from "@/features/transactions/ui/atoms";
import { Amount, Icon } from "@/shared/ui/atoms";
import { CategoryColor } from "@/features/categories/model/types";
import { Circle } from "lucide-react";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";

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
      ariaLabel={`Open transaction: ${title}`}
    />
  );
}

TransactionRow.displayName = "TransactionRow";