
export type Period = "current" | "previous";

export type CategorySummary = {
  categoryId: string | null;
  categoryName: string;
  total: number;
};

export type MonthlySummary = {
  month: string; // YYYY-MM
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  topCategories: CategorySummary[];
};

export type DailyPoint = {
  day: number;        // 1..31
  date: string;       // YYYY-MM-DD
  expenseTotal: number;
};

export type TrendSummary = {
  daily: DailyPoint[];
  avgExpensePerDay: number;
  peakExpenseDay: DailyPoint | null;
};

