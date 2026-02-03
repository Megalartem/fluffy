import * as React from "react";
import type { Transaction, TransactionType, TransactionsFilterValues } from "../model/types";
import { TransactionsRepo } from "../api/repo";
import {
  buildCategoryMap,
  applyClientFilters,
} from "./utils/transactions";


export function useTransactions(params: {
  workspaceId: string;
  filters: TransactionsFilterValues;
  repo: TransactionsRepo;
  categories?: Array<{ id: string; name: string }>;

  /** MVP: просто увеличиваем limit, без cursor */
  initialLimit?: number;
  step?: number;
}) {
  const { workspaceId, filters, repo, categories, initialLimit = 50, step = 50 } = params;
  // TODO: useWorkspace hook for workspaceId
  // TODO: useCategories hook for categories

  const categoryNameById = React.useMemo(
    () => buildCategoryMap(categories),
    [categories]
  );

  const [limit, setLimit] = React.useState(initialLimit);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const categoryIdsKey = filters.categoryIds.join("|");
  const sortKey = JSON.stringify(filters.sort);
  const filtersRef = React.useRef(filters);

  React.useEffect(() => {
    filtersRef.current = filters;
  }, [
    filters.type,
    filters.query,
    categoryIdsKey,
    sortKey
  ]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f = filtersRef.current;
      const baseType =
        f.type !== "all" ? (f.type as TransactionType) : undefined;

      const all = await repo.list(workspaceId, { type: baseType, limit });

      const filtered = applyClientFilters(all, f, categoryNameById);
      setTransactions(filtered);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [limit, repo, workspaceId, categoryNameById]);

  
  React.useEffect(() => {
    setLimit(initialLimit);
  }, [
    filters.type,
    filters.query,
    categoryIdsKey,
    sortKey,
    initialLimit,
  ]);

  React.useEffect(() => {
    void refresh();
  }, [refresh, 
    filters.type,
    filters.query, 
    categoryIdsKey, 
    sortKey]);

  const loadMore = React.useCallback(() => {
    setLimit((prev) => prev + step);
  }, [step]);

  const hasMore = transactions.length >= limit;

  return { transactions, loading, error, refresh, loadMore, hasMore, limit };
}