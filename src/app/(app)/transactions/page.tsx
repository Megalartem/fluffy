"use client";

import { useEffect, useState } from "react";
import { fmt } from "@/shared/lib/formatter";
import { TransactionSheet } from "@/features/transactions/ui/transaction-sheet";
import { FiltersIconButton, TransactionsFiltersModal } from "@/features/transactions/ui/filters-modal";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { Pagination, usePagination } from "@/shared/ui/pagination";


export default function TransactionsPage() {
  const {
    state,
    load,
    categories,
    categoriesMap,
    filters,
    setFilters,
    setQuery,
    filtersActive,
    sort,
    toggleSort,
    resetSort,
    filteredItems,
  } = useTransactions();

  const pagination = usePagination(filteredItems.length, 25);
  const paginatedItems = pagination.paginate(filteredItems);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<import("@/features/transactions/model/types").Transaction | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    pagination.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort]);

  function openEdit(tx: import("@/features/transactions/model/types").Transaction) {
    setEditingTx(tx);
    setEditOpen(true);
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setFilters((prev) => ({ ...prev, query: "" }));
    }
  }

  return (
    <div className="p-6 space-y-4 relative">
      <div className="sticky top-0 z-30 -mx-6 px-6 pt-6 pb-3 bg-white/90 backdrop-blur border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Транзакции</h1>
          <button className="rounded-xl border px-3 py-2" onClick={load} type="button">
            Обновить
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              className="w-full rounded-xl border px-3 py-2 pr-10 text-sm"
              placeholder="Поиск (заметка, категория или сумма)"
              value={filters.query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
            />

            {filters.query.trim() ? (
              <button
                type="button"
                aria-label="Очистить поиск"
                title="Очистить"
                onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 opacity-70 hover:opacity-100"
              >
                ×
              </button>
            ) : null}
          </div>

          <FiltersIconButton active={filtersActive} onClick={() => setFiltersOpen(true)} />
        </div>
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

      {state.status === "ready" && (state as any).items?.length === 0 ? (
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

      {state.status === "ready" && (state as any).items?.length > 0 && filteredItems.length === 0 ? (
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-semibold">Ничего не найдено</div>
          <div className="opacity-70 mt-1">Попробуй изменить фильтры или очистить поиск.</div>
          <button
            className="mt-4 rounded-2xl border px-4 py-3 font-semibold"
            onClick={() => {
              setFilters({ type: "all", categoryId: "", query: "" });
              // также сбрасываем debounce/query, если он живёт в хуке
              setQuery("");
            }}
            type="button"
          >
            Сбросить
          </button>
        </div>
      ) : null}

      {state.status === "ready" && filteredItems.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            {paginatedItems.map((t) => {
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

          {filteredItems.length > 10 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={filteredItems.length}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.goToPage}
              onItemsPerPageChange={pagination.setItemsPerPage}
            />
          )}
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
        categories={categories}
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters({ type: "all", categoryId: "", query: "" })}

        sort={sort}
        onToggleSort={toggleSort}
        onResetSort={resetSort}
      />

    </div>
  );
}
