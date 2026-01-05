"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/shared/config/workspace-context";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import type { Transaction } from "@/features/transactions/model/types";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";
import type { Category } from "@/features/categories/model/types";
import type { TxFilters, SortState, SortKey } from "@/features/transactions/ui/filters-modal";
import { sortByKey, type SortOrder } from "@/shared/lib/sort";

export type TxState =
  | { status: "loading" }
  | { status: "ready"; items: Transaction[] }
  | { status: "error"; message: string };

export function useTransactions() {
  const { workspaceId } = useWorkspace();
  const repo = useMemo(() => new DexieTransactionsRepo(), []);
  const [state, setState] = useState<TxState>({ status: "loading" });

  const [categoriesMap, setCategoriesMap] = useState<Map<string, Category>>(new Map());
  const categories = useMemo(
    () => (categoriesMap.size > 0 ? Array.from(categoriesMap.values()) : []),
    [categoriesMap]
  );

  const [filters, setFilters] = useState<TxFilters>({ type: "all", categoryId: "", query: "" });

  // Debounce search to reduce re-filtering while typing
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 180);
    return () => clearTimeout(id);
  }, [filters.query]);

  const [sort, setSort] = useState<SortState>({ key: "none" });

  const setQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  }, []);

  const filtersActive = filters.type !== "all" || !!filters.categoryId || sort.key !== "none";
  const filtersActiveCount =
    (filters.type !== "all" ? 1 : 0) + (filters.categoryId ? 1 : 0) + (sort.key !== "none" ? 1 : 0);

  const toggleSort = useCallback((key: Exclude<SortKey, "none">) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "desc" } as SortState;
      if (prev.key === key && prev.dir === "desc") return { key, dir: "asc" } as SortState;
      if (prev.key === key && prev.dir === "asc") return { key: "none" } as SortState;
      return { key, dir: "desc" } as SortState;
    });
  }, []);

  const resetSort = useCallback(() => setSort({ key: "none" }), []);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const [items, categories] = await Promise.all([
        repo.list(workspaceId, { limit: 50 }),
        new DexieCategoriesRepo().list(workspaceId),
      ]);

      const map = new Map<string, Category>();
      categories.forEach((c) => map.set(c.id, c));
      setCategoriesMap(map);

      setState({ status: "ready", items });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [repo, workspaceId]);

  const filteredItems = useMemo(() => {
    if (state.status !== "ready") return [] as Transaction[];

    const q = debouncedQuery.trim().toLowerCase();

    const res = state.items.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.categoryId && (t.categoryId ?? "") !== filters.categoryId) return false;

      if (q) {
        const note = (t.note ?? "").toLowerCase();
        const catName = t.categoryId
          ? (categoriesMap.get(t.categoryId)?.name ?? "").toLowerCase()
          : "";

        const qNumber = Number(q.replace(",", "."));
        const amountStr = String(t.amountMinor);

        const matchText = note.includes(q) || catName.includes(q);
        const matchAmount = Number.isFinite(qNumber) && amountStr.includes(String(qNumber));

        if (!matchText && !matchAmount) return false;
      }

      return true;
    });

    if (sort.key === "none") return res;

    const order: SortOrder = sort.dir === "asc" ? "asc" : "desc";

    if (sort.key === "category") {
      // Для категорий делаем сортировку по имени категории
      const withCategoryNames = res.map((t) => ({
        ...t,
        categoryName: t.categoryId ? (categoriesMap.get(t.categoryId)?.name ?? "") : "",
      }));
      return sortByKey(withCategoryNames, "categoryName" as keyof typeof withCategoryNames[0], order);
    }

    if (sort.key === "amount") {
      return sortByKey(res, "amountMinor", order);
    }

    return sortByKey(res, sort.key as keyof Transaction, order);
  }, [state, filters.type, filters.categoryId, debouncedQuery, categoriesMap, sort]);

  const totalCount = state.status === "ready" ? state.items.length : 0;

  return {
    state,
    totalCount,
    load,
    categories,
    categoriesMap,
    filters,
    setFilters,
    setQuery,
    filtersActive,
    filtersActiveCount,
    sort,
    toggleSort,
    resetSort,
    filteredItems,
  } as const;
}
