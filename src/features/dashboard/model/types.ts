
export type Period = "current" | "previous";

export type CategorySummary = {
  categoryId: string | null;
  categoryName: string;
  total: number;
};

export type MonthlySummary = {
  month: string; // YYYY-MM
  label: string; // Месяц ГГГГ
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  topCategories: CategorySummary[];
  daily: DailyPoint[];
  avgExpensePerDay: number;
  peakExpenseDay: DailyPoint | null;
};

export type DailyPoint = {
  day: number;        // 1..31
  date: string;       // YYYY-MM-DD
  expenseTotal: number;
};
