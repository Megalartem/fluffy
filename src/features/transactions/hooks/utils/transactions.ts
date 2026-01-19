import { Transaction, TransactionsFilterValues } from "../../model/types";

export function buildCategoryMap(
  categories?: Array<{ id: string; name: string }>
): Record<string, string> | undefined {
  if (!categories || categories.length === 0) return undefined;
  const m: Record<string, string> = {};
  for (const c of categories) {
    m[c.id] = c.name;
  }
  return m;
}

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function matchesQuery(
  transaction: Transaction,
  query: string,
  categoryNameById?: Record<string, string>
): boolean {
  // 1) primary: category name
  if (categoryNameById && transaction.categoryId) {
    const catName = (categoryNameById[transaction.categoryId] ?? "").toLowerCase();
    if (catName && catName.includes(query)) return true;
  }

  // 2) secondary: note
  const note = (transaction.note ?? "").toLowerCase();
  return note.includes(query);
}

function filterByType(
  transactions: Transaction[],
  type: TransactionsFilterValues["type"]
): Transaction[] {
  if (type === "all") return transactions;
  return transactions.filter((t) => t.type === type);
}

function filterByCategories(
  transactions: Transaction[],
  categoryIds: string[]
): Transaction[] {
  if (categoryIds.length === 0) return transactions;
  const set = new Set(categoryIds);
  return transactions.filter((t) =>
    t.categoryId ? set.has(t.categoryId) : false
  );
}

function filterByQuery(
  transactions: Transaction[],
  query: string,
  categoryNameById?: Record<string, string>
): Transaction[] {
  const q = normalizeQuery(query);
  if (!q || q.length <= 3) return transactions;
  return transactions.filter((t) =>
    matchesQuery(t, q, categoryNameById)
  );
}

function sortTransactions(
  transactions: Transaction[],
  sort: TransactionsFilterValues["sort"]
): Transaction[] {
  if (!sort.key || !sort.direction) return transactions;

  const dir = sort.direction === "asc" ? 1 : -1;
  const sorted = [...transactions];

  const tieBreakNewestFirst = (a: Transaction, b: Transaction) => {
    if (a.dateKey !== b.dateKey) return b.dateKey.localeCompare(a.dateKey);
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  };

  if (sort.key === "date") {
    sorted.sort((a, b) =>
      a.dateKey === b.dateKey
        ? a.createdAt.localeCompare(b.createdAt) * dir
        : a.dateKey.localeCompare(b.dateKey) * dir
    );
  } else if (sort.key === "amount") {
    sorted.sort((a, b) => {
      const cmp = (a.amountMinor - b.amountMinor) * dir;
      return cmp !== 0 ? cmp : tieBreakNewestFirst(a, b);
    });
  } else if (sort.key === "type") {
    const weight: Record<Transaction["type"], number> = {
      expense: 0,
      income: 1,
      transfer: 2,
    };
    sorted.sort((a, b) => {
      const cmp = (weight[a.type] - weight[b.type]) * dir;
      return cmp !== 0 ? cmp : tieBreakNewestFirst(a, b);
    });
  }

  return sorted;
}

export function applyClientFilters(
  transactions: Transaction[],
  filters: TransactionsFilterValues,
  categoryNameById?: Record<string, string>
): Transaction[] {
  let res = transactions;
  res = filterByType(res, filters.type);
  res = filterByCategories(res, filters.categoryIds);
  res = filterByQuery(res, filters.query, categoryNameById);
  res = sortTransactions(res, filters.sort);
  return res;
}