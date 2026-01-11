"use client";

import { useEffect, useState } from "react";
import { fmt } from "@/shared/lib/formatter";
import { TransactionSheet } from "@/features/transactions/ui/transaction-sheet";
import { TransactionsFiltersModal } from "@/features/transactions/ui/filters-modal";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { Pagination, usePagination } from "@/shared/ui/pagination";
import { Container } from "@/shared/ui/container";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Alert } from "@/shared/ui/alert";
import { ListItem } from "@/shared/ui/list-item";
// import { FilterToggle } from "@/shared/ui/filter-toggle";
import { Spinner } from "@/shared/ui/spinner";


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
    filtersActiveCount,
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
    <Container className="relative space-y-4 pb-6">
      <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 pt-6 pb-3 border-b border-border bg-surface/90 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text">Транзакции</h1>
          <Button variant="secondary" onClick={load} type="button">
            Обновить
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Input
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
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-text-subtle hover:text-text"
              >
                ×
              </button>
            ) : null}
          </div>

          <FilterToggle activeCount={filtersActiveCount} onClick={() => setFiltersOpen(true)} />
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="flex items-center gap-2 text-text-subtle">
          <Spinner />
          <span>Загрузка…</span>
        </div>
      ) : null}

      {state.status === "error" ? (
        <Alert
          variant="danger"
          title="Ошибка"
          description={state.message}
          actions={<Button variant="secondary" onClick={load}>Повторить</Button>}
        />
      ) : null}

      {state.status === "ready" && (state as any).items?.length === 0 ? (
        <EmptyState
          title="Пока нет записей"
          description="Добавь первую трату — это займёт пару секунд."
          action={<Button onClick={() => setCreateOpen(true)}>Добавить</Button>}
        />
      ) : null}

      {state.status === "ready" && (state as any).items?.length > 0 && filteredItems.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          description="Попробуй изменить фильтры или очистить поиск."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({ type: "all", categoryId: "", query: "" });
                setQuery("");
              }}
            >
              Сбросить
            </Button>
          }
        />
      ) : null}

      {state.status === "ready" && filteredItems.length > 0 ? (
        <div className="space-y-2">
          {paginatedItems.map((t) => {
            const category = t.categoryId ? categoriesMap.get(t.categoryId) : null;
            return (
              <ListItem
                key={t.id}
                interactive
                onClick={() => openEdit(t)}
                title={category?.name ?? "Без категории"}
                subtitle={t.note ? t.note : t.date}
                end={
                  <div className="font-semibold tabular-nums text-text">
                    {t.type === "expense" ? "-" : "+"}
                    {fmt(t.amount)} {t.currency}
                  </div>
                }
              />
            );
          })}

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
      {/* <TransactionsFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categories}
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters({ type: "all", categoryId: "", query: "" })}
        sort={sort}
        onToggleSort={toggleSort}
        onResetSort={resetSort}
      /> */}
    </Container>
  );
}