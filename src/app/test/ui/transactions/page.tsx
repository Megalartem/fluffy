"use client";

import { useEffect, useMemo, useState } from "react";

import { TransactionCategoryIcon } from "@/features/transactions/ui/atoms/TransactionCategoryIcon/TransactionCategoryIcon";
import { TransactionRow, TransactionsDayGroup, TransactionsDayGroupModel, TransactionsList } from "@/features/transactions/ui/molecules";

import { Bus, Car, Coffee, FerrisWheel, HomeIcon, ShoppingCart } from "lucide-react";
import { Heading, Text, OptionBaseProps, Icon } from "@/shared/ui/atoms";
import {
  TransactionsFilter,
  TransactionsFiltersValue,
} from "@/features/transactions/ui/components/TransactionsFilter/TransactionsFilter";

export default function TestUITransactionsPage() {
  function wait(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Mock "server" pages
  const pages = useMemo(
    () => [
      [
        {
          id: "2025-06-21",
          title: "Saturday, 21 June",
          totalText: "$272.5",
          items: [
            {
              id: "t1",
              title: "Grocery",
              subtitle: "10:20",
              amount: 160,
              currency: "$",
              txType: "expense" as const,
              icon: ShoppingCart,
              categoryColor: "violet" as const,
            },
            {
              id: "t2",
              title: "Transport",
              subtitle: "12:10",
              amount: 35,
              currency: "$",
              txType: "expense" as const,
              icon: Bus,
              categoryColor: "steel" as const,
            },
            {
              id: "t3",
              title: "Cafe",
              subtitle: "18:40",
              amount: 27.5,
              currency: "$",
              txType: "expense" as const,
              icon: Coffee,
              categoryColor: "amber" as const,
            },
          ],
        },
        {
          id: "2025-06-20",
          title: "Friday, 20 June",
          totalText: "$120",
          items: [
            {
              id: "t4",
              title: "Home",
              subtitle: "21:00",
              amount: 120,
              currency: "$",
              txType: "expense" as const,
              icon: HomeIcon,
              categoryColor: "sand" as const,
            },
          ],
        },
      ],
      [
        {
          id: "2025-06-19",
          title: "Thursday, 19 June",
          totalText: "$58",
          items: [
            {
              id: "t5",
              title: "Transport",
              subtitle: "09:10",
              amount: 18,
              currency: "$",
              txType: "expense" as const,
              icon: Bus,
              categoryColor: "steel" as const,
            },
            {
              id: "t6",
              title: "Cafe",
              subtitle: "14:30",
              amount: 40,
              currency: "$",
              txType: "expense" as const,
              icon: Coffee,
              categoryColor: "amber" as const,
            },
          ],
        },
      ],
      [
        {
          id: "2025-06-18",
          title: "Wednesday, 18 June",
          totalText: "$500",
          items: [
            {
              id: "t7",
              title: "Salary",
              subtitle: "11:00",
              amount: 500,
              currency: "$",
              txType: "income" as const,
              icon: HomeIcon,
              categoryColor: "green" as const,
            },
          ],
        },
      ],
    ],
    []
  );

  const [listState, setListState] = useState<"loading" | "ready">("loading");
  const [groups, setGroups] = useState<TransactionsDayGroupModel[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loadMoreState, setLoadMoreState] = useState<"idle" | "loading" | "disabled">("disabled");

  const [txFilters, setTxFilters] = useState<TransactionsFiltersValue>({
    query: "",
    type: "all",
    categories: [],
    sort: { key: null, direction: null },
  });

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

  const categoryOptions = useMemo<OptionBaseProps[]>(
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

  async function loadInitial() {
    setListState("loading");
    setGroups([]);
    setPageIndex(0);
    setLoadMoreState("disabled");

    await wait(2000);

    const first = pages[0] ?? [];
    setGroups(first);
    setListState("ready");
    setLoadMoreState(pages.length > 1 ? "idle" : "disabled");
  }

  async function loadMore() {
    if (loadMoreState !== "idle") return;

    setLoadMoreState("loading");
    await wait(2000);

    const nextIndex = pageIndex + 1;
    const nextPage = pages[nextIndex];

    if (!nextPage) {
      setLoadMoreState("disabled");
      return;
    }

    setGroups((prev) => [...prev, ...nextPage]);
    setPageIndex(nextIndex);

    const hasMore = nextIndex < pages.length - 1;
    setLoadMoreState(hasMore ? "idle" : "disabled");
  }

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg-main p-l space-y-xl p-4 gap-4">
      <h1>Test UI Molecules Page</h1>

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

      <div style={{ padding: 16, display: "grid", gap: 16, width: "100%" }}>
        <TransactionsDayGroup
          title="Saturday, 21 June"
          totalText="272.5 $"
          items={[
            {
              id: "1",
              title: "Grocery",
              amount: 160,
              currency: "$",
              txType: "expense",
              icon: HomeIcon,
              categoryColor: "violet",
              onClick: () => console.log("Grocery clicked"),
            },
            {
              id: "2",
              title: "Transport",
              amount: 35,
              currency: "$",
              txType: "expense",
              icon: Car,
              categoryColor: "steel",
              onClick: () => console.log("Transport clicked"),
            },
            {
              id: "3",
              title: "Cafe",
              amount: 27.5,
              currency: "$",
              txType: "expense",
              icon: Coffee,
              categoryColor: "amber",
              onClick: () => console.log("Cafe clicked"),
            },
            {
              id: "4",
              title: "Entertainment",
              amount: 50,
              currency: "$",
              txType: "expense",
              icon: FerrisWheel,
              categoryColor: "sand",
              onClick: () => console.log("Entertainment clicked"),
            },
          ]}
        />
      </div>

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
          groups={groups}
          state={listState}
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
              categories: txFilters.categories.map(c => ({
                label: c.label,
                value: c.value,
              })),
            })}
          </Text>
        </div>
      </div>
    </div>
  );
}
