"use client";

import { EmptyState } from "@/shared/ui/molecules/EmptyState/EmptyState";
import { TransactionsFilter } from "@/features/transactions/ui/components/TransactionsFilter/TransactionsFilter";
import TransactionUpsertSheet from "@/features/transactions/ui/components/TransactionUpsertSheet/TransactionUpsertSheet";
import { FAB } from "@/shared/ui/atoms/FAB/FAB";
import { Plus } from "lucide-react";

import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import type { CreateTransactionInput, Transaction, TransactionsFilterValues, UpdateTransactionInput } from "@/features/transactions/model/types";
import { transactionsRepo } from "@/features/transactions/api/repo.dexie";
import styles from "./transactions.module.css";
import { TransactionsList } from "@/features/transactions/ui/components";
import { useTransactionMutations } from "@/features/transactions/hooks/utils/useTransactionMutation";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ConfirmDialog } from "@/shared/ui/molecules/ConfirmDialog/ConfirmDialog";
import { useState, useMemo, useCallback } from "react";

const EMPTY_STATES = {
  noTransactions: {
    title: "No transactions yet",
    description: "Add your first income or expense — it will appear here.",
    primaryActionLabel: "Add transaction",
  },
  noFilterTransactions: {
    title: "No results",
    description: "Try changing filters or reset them.",
    primaryActionLabel: "Reset filters",
  },
  error: {
    title: "Something went wrong",
    description: "Try again.",
    primaryActionLabel: "Reload",
  },
};

const INITIAL_FILTERS: TransactionsFilterValues = {
  query: "",
  type: "all",
  categoryIds: [],
  sort: { key: null, direction: null },
};


export default function TransactionsPage() {
  const { workspaceId } = useWorkspace();
  const { items: categories } = useCategories({ includeArchived: true });

  const [filters, setFilters] = useState<TransactionsFilterValues>(INITIAL_FILTERS);
  const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined);
  const [deletingTx, setDeletingTx] = useState<Transaction | undefined>(undefined);

  const sortOptions = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
    ],
    []
  );

  const { transactions, loading, error, refresh } = useTransactions({
    workspaceId,
    filters,
    repo: transactionsRepo,
    categories,
  });

  const { txCreate, txUpdate, txRemove } = useTransactionMutations({
    workspaceId,
    refresh,
  });

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleRetry = useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  const handleCreated = useCallback(async (input: CreateTransactionInput) => {
    await txCreate(input);
    await handleRefresh();
  }, [txCreate, handleRefresh]);

  const handleUpdated = useCallback(async (input: UpdateTransactionInput) => {
    await txUpdate(input);
    await handleRefresh();
  }, [handleRefresh, txUpdate]);

  const handleCreateNew = useCallback(() => {
    setEditingTx({} as Transaction);
  }, []);

  const filtersActive =
    Boolean(filters.query.trim()) ||
    filters.type !== "all" ||
    filters.categoryIds.length > 0 ||
    Boolean(filters.sort.key || filters.sort.direction);

  const isEmpty = !loading && transactions.length === 0;

  const handleOpenCreate = useCallback(() => {
    setEditingTx(undefined);
  }, []);

  const handleOpenEdit = useCallback((tx: Transaction) => {
    setEditingTx(tx);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setEditingTx(undefined);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleFiltersChange = useCallback((newFilters: TransactionsFilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleDelete = useCallback((tx: Transaction) => {
    setDeletingTx(tx);
  }, []);

  const confirmDelete = useCallback(async () => {
  if (deletingTx) {
    await txRemove(deletingTx.id);
    setDeletingTx(undefined);
    await handleRefresh();
    
    setTimeout(() => {
      setEditingTx(undefined);
    }, 100);
  }
}, [deletingTx, txRemove, handleRefresh]);

  const handleCancelDelete = useCallback(() => {
    setDeletingTx(undefined);
  }, []);

  const defaultCategory = categories.find(c => c.type === "expense" && !c.isArchived);

  return (
    <div className={styles.body}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Transactions</div>
      </div>
      <TransactionsFilter
        value={filters}
        onChange={handleFiltersChange}
        categories={categories}
        sortOptions={sortOptions}
      />

      {error ? (
        <EmptyState
          title={EMPTY_STATES.error.title}
          description={EMPTY_STATES.error.description}
          tone="muted"
          primaryAction={{ label: EMPTY_STATES.error.primaryActionLabel, onClick: handleRetry }}
        />
      ) : isEmpty ? (
        <EmptyState
          title={EMPTY_STATES.noTransactions.title}
          description={EMPTY_STATES.noTransactions.description}
          tone="muted"
          primaryAction={{ label: EMPTY_STATES.noTransactions.primaryActionLabel, onClick: handleOpenCreate }}
        />
      ) : (
        <TransactionsList
          transactions={transactions}
          categories={categories}
          loading={loading}
          error={error}
          sort={filters.sort}
          onRetry={handleRetry}
          filtersActive={filtersActive}
          onResetFilters={handleResetFilters}
          onAddTransaction={handleCreateNew}
          onTransactionClick={handleOpenEdit}
          onTransactionDelete={handleDelete}
        />
      )}

      <FAB
        icon={Plus}
        aria-label="Add transaction"
        onClick={handleCreateNew}
      />

      <TransactionUpsertSheet
        open={editingTx !== undefined}
        categories={categories}
        transaction={editingTx}

        onClose={handleCloseSheet}
        onCreate={handleCreated}
        onUpdate={handleUpdated}
        onDelete={setDeletingTx}
        defaultCategoryState={defaultCategory ? { id: defaultCategory.id, type: defaultCategory.type } : undefined}
      />

      <ConfirmDialog
        title="Delete transaction?"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        open={deletingTx !== undefined}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}