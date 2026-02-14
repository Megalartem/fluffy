import React, { Suspense, useState } from "react";

import { ActionMenu, ActionMenuItem, ListRowBase } from "@/shared/ui/molecules";
import { TransactionCategoryIcon } from "@/features/transactions/ui/atoms";
import { Amount, Icon } from "@/shared/ui/atoms";
import { Category } from "@/features/categories/model/types";
import { Circle, Pencil, Trash2 } from "lucide-react";
import { fromMinorByCurrency } from "@/shared/lib/money/helper";
import { Transaction } from "@/features/transactions/model/types";
import { dynamicIconImports, IconName } from "lucide-react/dynamic";
import styles from "./TransactionRow.module.css";

export type TransactionRowProps = {
  transaction: Transaction;
  category: Category | undefined;
  size?: "m" | "l";
  tone?: "default" | "muted" | "ghost";

  selected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

export function TransactionRow({
  transaction,
  category,
  size = "m",
  tone = "default",
  onClick,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actions: ActionMenuItem[] = [
    {
      id: "edit",
      icon: Pencil,
      label: "Edit",
      onAction: onEdit,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      onAction: onDelete,
      variant: "danger",
    },
  ]
  return (
    <ListRowBase
      leading={
        <Suspense fallback={<Icon icon={Circle} size={size === "l" ? "m" : "s"} />}>
          <TransactionCategoryIcon
            icon={category ? getLazyLucideIcon(category.iconKey) : Circle}
            size={size === "l" ? "m" : "s"}
            color={category?.colorKey ?? "default"}
            txType={transaction.type}
          />
        </Suspense>
      }
      title={category?.name ?? "Unknown category"}
      subtitle={transaction.note ?? undefined}
      trailing={
        <>
                <Amount
          state={transaction.type === "expense" ? "negative" : "positive"}
        >
          {fromMinorByCurrency(transaction.amountMinor, transaction.currency)}
        </Amount>
        <ActionMenu
            ariaLabel="Transaction actions"
            items={actions}
            onAction={() => { }}
            triggerButtonBody={<></>}
            triggerClassName={styles.triggerActionButton}
            isOpen={isActionsMenuOpen}
            onOpenChange={setIsActionsMenuOpen}
          />
        </>

      }
      size={size}
      tone={tone}
      onClick={onClick}
      onLongPress={() => setIsActionsMenuOpen(true)}
      ariaLabel={`Open transaction: ${category?.name ?? "Unknown category"}`}
    />
  );
}

TransactionRow.displayName = "TransactionRow";