"use client";

import * as React from "react";
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

  const [filters, setFilters] = React.useState<TransactionsFilterValues>(INITIAL_FILTERS);
  const [upsertOpen, setUpsertOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<Transaction | undefined>(undefined);

  const sortOptions = React.useMemo(
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

  const handleRefresh = React.useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleRetry = React.useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  const handleCreated = React.useCallback(async (input: CreateTransactionInput) => {
    await txCreate(input);
    await handleRefresh();
  }, [txCreate, handleRefresh]);

  const handleUpdated = React.useCallback(async (input: UpdateTransactionInput) => {
    await txUpdate(input);
    await handleRefresh();
  }, [handleRefresh, txUpdate]);

  const filtersActive =
    Boolean(filters.query.trim()) ||
    filters.type !== "all" ||
    filters.categoryIds.length > 0 ||
    Boolean(filters.sort.key || filters.sort.direction);

  const isEmpty = !loading && transactions.length === 0;

  const handleOpenCreate = React.useCallback(() => {

    setEditing(undefined);
    setUpsertOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((tx: Transaction) => {
    setEditing(tx);
    setUpsertOpen(true);
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleFiltersChange = React.useCallback((newFilters: TransactionsFilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleDelete = React.useCallback((tx: Transaction) => {
    setDeleting(tx);
  }, []);

  const defaultCategoryId = categories.find(c => c.type === "expense" && !c.isArchived)?.id;

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
          currency="USD"
          loading={loading}
          error={error}
          sort={filters.sort}
          onRetry={handleRetry}
          filtersActive={filtersActive}
          onResetFilters={handleResetFilters}
          onAddTransaction={handleOpenCreate}
          onTransactionClick={handleOpenEdit}
          onTransactionDelete={handleDelete}
        />
      )}

      <FAB
        icon={Plus}
        aria-label="Add transaction"
        onClick={handleOpenCreate}
      />

      <TransactionUpsertSheet
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        workspaceId={workspaceId}
        currency="USD"
        categories={categories}
        type="expense"
        initial={editing}
        onCreate={handleCreated}
        onUpdate={handleUpdated}
        defaultCategoryState={defaultCategoryId ? { id: defaultCategoryId, type: "expense" } : undefined}
      />
      
      <ConfirmDialog
      title="Delete transaction?"
      description="Are you sure you want to delete this transaction? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      open={deleting !== undefined}
      onConfirm={async () => {
        if (deleting) {
          await txRemove(deleting.id);
          setDeleting(undefined);
          await handleRefresh();
        }
      }}
      onCancel={function (): void {
        setDeleting(undefined);
      } }
      />
    </div>
  );
}