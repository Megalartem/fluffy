"use client";

import { useMemo, useState, useCallback } from "react";

import type { Category } from "@/features/categories/model/types";
import type { Transaction } from "@/features/transactions/model/types";
import TransactionUpsertSheet from "@/features/transactions/ui/components/TransactionUpsertSheet/TransactionUpsertSheet";

import { TransactionCategoryIcon } from "@/features/transactions/ui/atoms/TransactionCategoryIcon/TransactionCategoryIcon";
import { ITransactionsDayGroup, TransactionRow } from "@/features/transactions/ui/molecules";

import { Bus, Coffee, FerrisWheel, HomeIcon, ShoppingCart } from "lucide-react";
import { Heading, Text, IOptionBase, Icon } from "@/shared/ui/atoms";
import {
  TransactionsFilter,
  TransactionsFiltersValue,
} from "@/features/transactions/ui/components/TransactionsFilter/TransactionsFilter";
import { TransactionsList } from "@/features/transactions/ui/components";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));


// Mock "server" pages (stable reference)
const PAGES: ITransactionsDayGroup[][] = [
  [
    {
      title: "Saturday, 21 June",
      totalText: "$272.50",
      transactions: [
        {
          id: "tx_1",
          workspaceId: "ws_test",
          type: "expense",
          amountMinor: 15000,
          currency: "USD",
          categoryId: "cat_grocery",
          note: "Bought groceries",
          dateKey: "2025-06-21",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
        {
          id: "tx_2",
          workspaceId: "ws_test",
          type: "expense",
          amountMinor: 12250,
          currency: "USD",
          categoryId: "cat_transport",
          note: "Bus ticket",
          dateKey: "2025-06-21",
          createdAt: new Date().toISOString(),
          updatedAt: new  Date().toISOString(),
          deletedAt: null,
        },
      ],
      categories: [],
    },
  ],
  [
    {
      title: "Friday, 20 June",
      totalText: "$80.00",
      transactions: [
        {
          id: "tx_3",
          workspaceId: "ws_test",
          type: "income",
          amountMinor: 8000,
          currency: "USD",
          categoryId: "cat_salary",
          note: "Part of salary",
          dateKey: "2025-06-20",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
      categories: [],
    },
  ],
];

export default function TestUITransactionsPage() {
  const [listState, setListState] = useState<"loading" | "ready">("ready");
  const [groups, setGroups] = useState<ITransactionsDayGroup[]>(() => PAGES[0] ?? []);
  const [pageIndex, setPageIndex] = useState(0);
  const [loadMoreState, setLoadMoreState] = useState<"idle" | "loading" | "disabled">(
    PAGES.length > 1 ? "idle" : "disabled"
  );

  const [txFilters, setTxFilters] = useState<TransactionsFiltersValue>({
    query: "",
    type: "all",
    categoryIds: [],
    sort: { key: null, direction: null },
  });

  // TransactionUpsertSheet demo state
  const [upsertOpen, setUpsertOpen] = useState(false);
  const [upsertInitial, setUpsertInitial] = useState<Transaction | undefined>(undefined);

  const workspaceId = "ws_test";
  const currency: string = "USD";
  const txType: "expense" | "income" | "transfer" = "expense";

  const mockCategories = useMemo<Category[]>(
    () => [
      {
        id: "cat_grocery",
        workspaceId,
        name: "Grocery",
        type: "expense",
        iconKey: "shopping-basket",
        colorKey: "violet",
        order: 1,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        id: "cat_transport",
        workspaceId,
        name: "Transport",
        type: "expense",
        iconKey: "bus",
        colorKey: "steel",
        order: 2,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      {
        id: "cat_salary",
        workspaceId,
        name: "Salary",
        type: "income",
        iconKey: "wallet",
        colorKey: "green",
        order: 1,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
    []
  );

  function openCreateTx() {
    setUpsertInitial(undefined);
    setUpsertOpen(true);
  }

  function openEditTx() {
    const now = new Date().toISOString();
    const initialTx: Transaction = {
      id: "tx_demo_1",
      workspaceId,
      type: txType,
      amountMinor: 12345,
      currency,
      categoryId: "cat_grocery",
      note: "Demo note",
      dateKey: "2025-06-21",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    setUpsertInitial(initialTx);
    setUpsertOpen(true);
  }

  const filterCategories = useMemo(
    () => [
      {
        id: "grocery",
        title: "Grocery",
        icon: ShoppingCart,
        categoryColor: "violet" as const,
      },
      {
        id: "transport",
        title: "Transport",
        icon: Bus,
        categoryColor: "steel" as const,
      },
      {
        id: "cafe",
        title: "Cafe",
        icon: Coffee,
        categoryColor: "amber" as const,
      },
      {
        id: "home",
        title: "Home",
        icon: HomeIcon,
        categoryColor: "sand" as const,
      },
      {
        id: "entertainment",
        title: "Entertainment",
        icon: FerrisWheel,
        categoryColor: "green" as const,
      },
    ],
    []
  );

  const categoryOptions = useMemo<IOptionBase[]>(
    () =>
      filterCategories.map((c) => ({
        label: c.title,
        value: c.id,
        icon: <Icon icon={c.icon} size="m" />,
      })),
    [filterCategories]
  );

  const sortOptions = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "amount", label: "Amount" },
    ],
    []
  );

  const loadInitial = useCallback(async () => {
    setListState("loading");
    setGroups([]);
    setPageIndex(0);
    setLoadMoreState("disabled");

    await wait(2000);

    const first = PAGES[0] ?? [];
    setGroups(first);
    setListState("ready");
    setLoadMoreState(PAGES.length > 1 ? "idle" : "disabled");
  }, []);

  const loadMore = useCallback(async () => {
    if (loadMoreState !== "idle") return;

    setLoadMoreState("loading");
    await wait(2000);

    const nextIndex = pageIndex + 1;
    const nextPage = PAGES[nextIndex];

    if (!nextPage) {
      setLoadMoreState("disabled");
      return;
    }

    setGroups((prev) => [...prev, ...nextPage]);
    setPageIndex(nextIndex);

    const hasMore = nextIndex < PAGES.length - 1;
    setLoadMoreState(hasMore ? "idle" : "disabled");
  }, [loadMoreState, pageIndex]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-main p-l space-y-xl p-4 gap-4">
      <h1>Test UI Molecules Page</h1>

      {/* TransactionUpsertSheet demo */}
      <div
        style={{
          border: "1px solid rgba(21,10,53,0.12)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <Heading as="h2" style={{ margin: 0 }}>
          TransactionUpsertSheet (demo)
        </Heading>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={openCreateTx}
            style={{
              border: "1px solid rgba(21,10,53,0.12)",
              borderRadius: 12,
              padding: "8px 12px",
              background: "white",
            }}
          >
            Open create
          </button>

          <button
            type="button"
            onClick={openEditTx}
            style={{
              border: "1px solid rgba(21,10,53,0.12)",
              borderRadius: 12,
              padding: "8px 12px",
              background: "white",
            }}
          >
            Open edit (prefilled)
          </button>
        </div>

        <Text>
          Current mode: {upsertInitial ? "edit" : "create"}
        </Text>
      </div>

      <TransactionCategoryIcon icon={ShoppingCart} txType="expense" size="m" color="blue" />

      <TransactionRow
        title="Grocery"
        amount={150}
        currency="$"
        txType="expense"
        icon={ShoppingCart}
        categoryColor="blue"
        size="m"
        tone="ghost"
        onClick={() => console.log("Transaction clicked")}
      />

      <div style={{ padding: 16, display: "grid", gap: 12, width: "100%" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>TransactionsList (mock)</h2>
          <button
            type="button"
            onClick={loadInitial}
            style={{
              marginLeft: "auto",
              border: "1px solid rgba(21,10,53,0.12)",
              borderRadius: 12,
              padding: "8px 12px",
              background: "white",
            }}
          >
            Update
          </button>
        </div>

        <TransactionsList
          transactions={transactions}
          categories={categories}
          loadMoreState={loadMoreState}
          onLoadMore={loadMore}
          skeletonCount={3}
        />
      </div>

      {/* TransactionsFilter demo section */}
      <div
        style={{
          border: "1px solid rgba(21,10,53,0.12)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <Heading as="h2" style={{ margin: 0 }}>
          TransactionsFilter (demo)
        </Heading>

        <TransactionsFilter
          value={txFilters}
          onChange={setTxFilters}
          categoryOptions={categoryOptions}
          sortOptions={sortOptions}
        />

        <div style={{ marginTop: 8 }}>
          <Text>
            txFilters: {JSON.stringify({
              ...txFilters,
              categoryIds: txFilters.categoryIds
            })}
          </Text>
        </div>
      </div>
      <TransactionUpsertSheet
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        workspaceId={workspaceId}
        type={txType}
        currency={currency}
        categories={mockCategories}
        initial={upsertInitial}
        onCreate={async (input) => {
          console.log("[demo] onCreate", input);
        }}
        onUpdate={async (input) => {
          console.log("[demo] onUpdate", input);
        }}
      />
    </div>
  );
}
