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
import {
  MOCK_CURRENCY,
  MOCK_WORKSPACE_ID,
  mockCategories,
  mockCategoryOptions,
  seedMockTransactionsIfEmpty,
} from "@/features/transactions/dev/mocks";
import { TransactionsList } from "@/features/transactions/ui/components";
import { useTransactionMutations } from "@/features/transactions/hooks/utils/useTransactionMutation";

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
  const isDev = process.env.NODE_ENV === "development";
  const didSeed = React.useRef(false);

  // Seed mock data in development
  React.useEffect(() => {
    if (!isDev || didSeed.current) return;
    didSeed.current = true;
    void seedMockTransactionsIfEmpty(MOCK_WORKSPACE_ID);
  }, [isDev]);

  const [filters, setFilters] = React.useState<TransactionsFilterValues>(INITIAL_FILTERS);
  const [upsertOpen, setUpsertOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Transaction | undefined>(undefined);

  const sortOptions = React.useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
    ],
    []
  );

  const { transactions, loading, error, refresh } = useTransactions({
    workspaceId: MOCK_WORKSPACE_ID,
    filters,
    repo: transactionsRepo,
    categories: mockCategories,
  });

  const { txCreate, txUpdate } = useTransactionMutations({
  workspaceId: MOCK_WORKSPACE_ID,
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

  return (
    <div className={styles.body}>
      <TransactionsFilter
        value={filters}
        onChange={handleFiltersChange}
        categoryOptions={mockCategoryOptions}
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
          categories={mockCategories}
          currency={MOCK_CURRENCY}
          loading={loading}
          error={error}
          sort={filters.sort}
          onRetry={handleRetry}
          filtersActive={filtersActive}
          onResetFilters={handleResetFilters}
          onAddTransaction={handleOpenCreate}
          onTransactionClick={handleOpenEdit}
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
        workspaceId={MOCK_WORKSPACE_ID}
        currency={MOCK_CURRENCY}
        categories={mockCategories}
        type="expense"
        initial={editing}
        onCreate={handleCreated}
        onUpdate={handleUpdated}
        defaultCategoryState={{ id: "cat_food", type: "expense" }}
      />
    </div>
  );
}