import * as React from "react";
import type { Transaction, TransactionType, TransactionsFilterValues } from "../model/types";
import { TransactionsRepo } from "../api/repo";
import {
  buildCategoryMap,
  applyClientFilters,
} from "./utils/transactions";
import { ensureSampleTransactionsSeeded } from "../model/seed";
import { cleanupOldMockData } from "../model/cleanup";


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

  const categoryNameById = React.useMemo(
    () => buildCategoryMap(categories),
    [categories]
  );

  const [limit, setLimit] = React.useState(initialLimit);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const didSeedRef = React.useRef(false);

  const categoryIdsKey = filters.categoryIds.join("|");
  const sortKey = JSON.stringify(filters.sort);
  const filtersRef = React.useRef(filters);

  React.useEffect(() => {
    filtersRef.current = filters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Seed sample transactions only once per workspace session
      if (!didSeedRef.current && categories && categories.length > 0) {
        didSeedRef.current = true;
        
        // Clean up old mock data first (one-time cleanup)
        await cleanupOldMockData();
        
        // Then seed new sample transactions
        await ensureSampleTransactionsSeeded(workspaceId);
      }

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
  }, [limit, repo, workspaceId, categoryNameById, categories]);

  // Reset seed flag when workspace changes
  React.useEffect(() => {
    didSeedRef.current = false;
  }, [workspaceId]);

  // Reset limit and refresh when filters change
  React.useEffect(() => {
    setLimit(initialLimit);
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.type,
    filters.query, 
    categoryIdsKey, 
    sortKey,
    initialLimit,
  ]);

  const loadMore = React.useCallback(() => {
    setLimit((prev) => prev + step);
  }, [step]);

  const hasMore = transactions.length >= limit;

  return { transactions, loading, error, refresh, loadMore, hasMore, limit };
}