"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import type { Transaction } from "@/features/transactions/model/types";
import { TransactionSheet } from "@/features/transactions/ui/transaction-sheet";
import { ensureDefaultCategoriesSeeded } from "@/features/categories/model/seed";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";
import type { Category } from "@/features/categories/model/types";
import { fmt } from "@/shared/lib/formatter";
import { FiltersIconButton, TransactionsFiltersModal, TxFilters, SortDir, SortKey, SortState } from "@/features/transactions/ui/filters-modal";


type State =
  | { status: "loading" }
  | { status: "ready"; items: Transaction[] }
  | { status: "error"; message: string };


export default function TransactionsPage() {
  const repo = useMemo(() => new DexieTransactionsRepo(), []);
  const [state, setState] = useState<State>({ status: "loading" });

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [categoriesMap, setCategoriesMap] = useState<Map<string, Category>>(new Map());
  const [filters, setFilters] = useState<TxFilters>({
    type: "all",
    categoryId: "",
    query: "",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: "none" });

  function toggleSort(key: Exclude<SortKey, "none">) {
    setSort((prev) => {
      // при нажатии на другой ключ — всегда стартуем с desc
      if (prev.key !== key) return { key, dir: "desc" };

      // тот же ключ: desc -> asc -> none
      if (prev.key === key && prev.dir === "desc") return { key, dir: "asc" };
      if (prev.key === key && prev.dir === "asc") return { key: "none" };
      return { key, dir: "desc" };
    });
  }

  const filtersActive = filters.type !== "all" || !!filters.categoryId || sort.key !== "none";

  async function load() {
    setState({ status: "loading" });
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();

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
  }

  const categories = useMemo(
    () => (categoriesMap.size > 0 ? Array.from(categoriesMap.values()) : []),
    [categoriesMap]
  );

  const filteredItems = useMemo(() => {
    if (state.status !== "ready") return [];

    const q = filters.query.trim().toLowerCase();

    // 1) filter
    const res = state.items.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.categoryId && (t.categoryId ?? "") !== filters.categoryId) return false;

      if (q) {
        const note = (t.note ?? "").toLowerCase();
        const catName = t.categoryId ? (categoriesMap.get(t.categoryId)?.name ?? "").toLowerCase() : "";

        const qNumber = Number(q.replace(",", "."));
        const amountStr = String(t.amount);

        const matchText = note.includes(q) || catName.includes(q);
        const matchAmount = Number.isFinite(qNumber) && amountStr.includes(String(qNumber));

        if (!matchText && !matchAmount) return false;
      }

      return true;
    });

    // 2) sort (tri-state)
    if (sort.key === "none") return res;

    const dirMul = sort.dir === "asc" ? 1 : -1;

    return [...res].sort((a, b) => {
      if (sort.key === "amount") {
        return (a.amount - b.amount) * dirMul;
      }

      if (sort.key === "type") {
        // expense / income
        // Сравниваем строками: asc: expense->income, desc: income->expense
        return String(a.type).localeCompare(String(b.type)) * dirMul;
      }

      if (sort.key === "category") {
        const an = a.categoryId ? (categoriesMap.get(a.categoryId)?.name ?? "") : "";
        const bn = b.categoryId ? (categoriesMap.get(b.categoryId)?.name ?? "") : "";
        return an.localeCompare(bn, "ru") * dirMul;
      }

      return 0;
    });
  }, [state, filters, categoriesMap, sort]);



  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setEditOpen(true);
  }

  return (
    <div className="p-6 space-y-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Транзакции</h1>
        <button className="rounded-xl border px-3 py-2" onClick={load} type="button">
          Обновить
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          placeholder="Поиск (заметка, категория или сумма)"
          value={filters.query}
          onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
        />

        <FiltersIconButton active={filtersActive} onClick={() => setFiltersOpen(true)} />
      </div>



      {state.status === "loading" ? <div>Loading…</div> : null}

      {state.status === "error" ? (
        <div className="rounded-2xl border p-4">
          <div className="font-medium">Ошибка</div>
          <div className="opacity-70">{state.message}</div>
          <button className="mt-3 rounded-xl border px-3 py-2" onClick={load} type="button">
            Повторить
          </button>
        </div>
      ) : null}

      {state.status === "ready" && filteredItems.length === 0 ? (
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-semibold">Пока нет записей</div>
          <div className="opacity-70 mt-1">Добавь первую трату — это займёт пару секунд.</div>
          <button
            className="mt-4 rounded-2xl bg-black text-white px-4 py-3 font-semibold"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            Добавить
          </button>
        </div>
      ) : null}

      {state.status === "ready" && filteredItems.length > 0 ? (
        <div className="space-y-2">
          {filteredItems.map((t) => {
            const category = t.categoryId ? categoriesMap.get(t.categoryId) : null;

            return (
              <button
                key={t.id}
                className="w-full text-left rounded-2xl border p-4 flex items-center justify-between hover:bg-black/5"
                onClick={() => openEdit(t)}
                type="button"
              >
                <div>
                  <div className="font-medium">
                    {category?.name ?? "Без категории"}
                  </div>

                  <div className="text-sm opacity-70">
                    {t.note ? t.note : t.date}
                  </div>
                </div>

                <div className="font-semibold tabular-nums">
                  {t.type === "expense" ? "-" : "+"}
                  {fmt(t.amount)} {t.currency}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Create */}
      <TransactionSheet
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onChanged={load}
      />

      {/* Edit */}
      <TransactionSheet
        open={editOpen}
        mode="edit"
        transaction={editingTx}
        onClose={() => {
          setEditOpen(false);
          setEditingTx(null);
        }}
        onChanged={load}
      />

      {/* Filters modal */}
      <TransactionsFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categoriesMap.size > 0 ? Array.from(categoriesMap.values()) : []}
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters({ type: "all", categoryId: "", query: "" })}

        sort={sort}
        onToggleSort={toggleSort}
        onResetSort={() => setSort({ key: "none" })}
      />

    </div>
  );
}
