import styles from "./TransactionsList.module.css";

import {
  TransactionsDayGroup,
  type TransactionsDayGroupItem,
} from "@/features/transactions/ui/molecules";

import { Skeleton, LoadMoreBar, type LoadMoreBarState } from "@/shared/ui/molecules";

export type TransactionsDayGroupModel = {
  id: string;        // "2025-06-21"
  title: string;     // "Saturday, 21 June"
  totalText: string; // "$272.5"
  items: TransactionsDayGroupItem[];
};

export type TransactionsListProps = {
  groups: TransactionsDayGroupModel[];

  /** общий стейт списка */
  state?: "ready" | "loading";

  /** pagination */
  loadMoreState?: LoadMoreBarState; // "idle" | "loading" | "disabled"
  onLoadMore?: () => void;

  /** skeleton */
  skeletonCount?: number;

  className?: string;
};

export function TransactionsList({
  groups,
  state = "ready",
  loadMoreState = "disabled",
  onLoadMore,
  skeletonCount = 2,
  className,
}: TransactionsListProps) {
  if (state === "loading") {
    return (
      <div className={[styles.root, className].filter(Boolean).join(" ")}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton
              key={index}
              variant="line"
              width="40%"
              height={16}
              style={{ marginBottom: 12 }}
            />
        ))}
      </div>
    );
  }

  const showLoadMore = loadMoreState !== "disabled";

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {groups.map((g) => (
        <TransactionsDayGroup
          key={g.id}
          title={g.title}
          totalText={g.totalText}
          items={g.items}
        />
      ))}

      {showLoadMore ? (
        <div className={styles.loadMore}>
          <LoadMoreBar
            state={loadMoreState}
            onLoadMore={loadMoreState === "idle" ? onLoadMore : undefined}
          />
        </div>
      ) : null}
    </div>
  );
}

TransactionsList.displayName = "TransactionsList";