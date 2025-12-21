import type { MonthlySummary, CategorySummary } from "./types";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";

function currentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export class DashboardService {
    constructor(
        private txRepo = new DexieTransactionsRepo(),
        private catRepo = new DexieCategoriesRepo()
    ) { }

    async getMonthlySummary(
        workspaceId: string,
        period: "current" | "previous" = "current"
    ): Promise<MonthlySummary & { label: string }> {
        const now = new Date();
        const date = period === "previous"
            ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
            : now;

        const month = monthKey(date);
        const label = period === "current" ? "Этот месяц" : monthLabel(date);
        const year = date.getFullYear();
        const monthIndex0 = date.getMonth();
        const dim = daysInMonth(year, monthIndex0);

        // daily totals по расходам
        const dailyTotals = new Array<number>(dim).fill(0);

        const [transactions, categories] = await Promise.all([
            this.txRepo.list(workspaceId),
            this.catRepo.list(workspaceId),
        ]);

        const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));

        let incomeTotal = 0;
        let expenseTotal = 0;
        const categoryTotals = new Map<string | null, number>();

        for (const t of transactions) {
            if (!t.date.startsWith(month)) continue;

            if (t.type === "income") {
                incomeTotal += t.amount;
            } else {
                expenseTotal += t.amount;

                // category totals (как было)
                const key = t.categoryId ?? null;
                categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + t.amount);

                // daily totals
                // t.date = YYYY-MM-DD
                const day = Number(t.date.slice(8, 10));
                if (Number.isFinite(day) && day >= 1 && day <= dim) {
                    dailyTotals[day - 1] += t.amount;
                }
            }
        }


        const daily = dailyTotals.map((expense, idx) => {
            const day = idx + 1;
            const dateStr = `${month}-${pad2(day)}`;
            return { day, date: dateStr, expenseTotal: expense };
        }) || [];

        const daysWithAnyExpense = daily.filter((d) => d.expenseTotal > 0);
        const avgExpensePerDay =
            daysWithAnyExpense.length === 0
                ? 0
                : Math.round(
                    (daysWithAnyExpense.reduce((s, d) => s + d.expenseTotal, 0) / daysWithAnyExpense.length) * 100
                ) / 100;

        const peakExpenseDay =
            daysWithAnyExpense.length === 0
                ? null
                : daysWithAnyExpense.reduce((best, cur) =>
                    cur.expenseTotal > best.expenseTotal ? cur : best
                );

        const topCategories = Array.from(categoryTotals.entries())
            .map(([categoryId, total]) => ({
                categoryId,
                categoryName: categoryId
                    ? categoriesMap.get(categoryId) ?? "Без категории"
                    : "Без категории",
                total,
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        return {
            month,
            label,
            incomeTotal,
            expenseTotal,
            balance: incomeTotal - expenseTotal,
            topCategories,
            daily,
            avgExpensePerDay,
            peakExpenseDay,
        };

    }

}

function monthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
    return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function daysInMonth(year: number, monthIndex0: number) {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

function pad2(n: number) {
    return String(n).padStart(2, "0");
}
