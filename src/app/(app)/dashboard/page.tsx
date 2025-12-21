"use client";

import { useEffect, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { DashboardService } from "@/features/dashboard/model/service";
import type { MonthlySummary } from "@/features/dashboard/model/types";
import { Sparkline } from "@/features/dashboard/ui/sparkline";
import { BudgetService } from "@/features/budgets/model/service";
import { BudgetCard } from "@/features/budgets/ui/budget-card";
import { BudgetLimitSheet } from "@/features/budgets/ui/budget-limit-sheet";
import type { BudgetStatus } from "@/features/budgets/model/types";



function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}


export default function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);



  async function load() {
    setLoading(true);
    const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
    Promise.all([
      new DashboardService().getMonthlySummary(workspaceId, period),
      new BudgetService().getBudgetStatus(workspaceId, period),
    ]).then(([data, budgetStatus]) => {
      setSummary(data);
      setBudget(budgetStatus);
    }).finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, [period]);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  if (!summary) {
    return <div className="p-6">Нет данных</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Обзор · {summary.label || "Месяц"}
      </h1>

      <div className="flex gap-2">
        <button
          className={`rounded-xl px-3 py-2 border ${period === "current" ? "bg-black text-white" : ""
            }`}
          onClick={() => setPeriod("current")}
        >
          Этот месяц
        </button>
        <button
          className={`rounded-xl px-3 py-2 border ${period === "previous" ? "bg-black text-white" : ""
            }`}
          onClick={() => setPeriod("previous")}
        >
          Прошлый
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-sm opacity-70">Доходы</div>
          <div className="text-xl font-semibold mt-1">+{fmt(summary.incomeTotal)}</div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-sm opacity-70">Расходы</div>
          <div className="text-xl font-semibold mt-1">-{fmt(summary.expenseTotal)}</div>
        </div>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border p-4">
        <div className="text-sm opacity-70">Баланс</div>
        <div className="text-2xl font-semibold mt-1">
          {summary.balance >= 0 ? "+" : ""}
          {summary.balance}
        </div>
      </div>

      {/* Budget */}
      {budget ? (
        <BudgetCard status={budget} onSetLimit={() => setBudgetOpen(true)} />
      ) : null}

      <BudgetLimitSheet
        open={budgetOpen}
        currency={budget?.currency ?? "₽"}
        initialValue={budget?.limit ?? null}
        onClose={() => setBudgetOpen(false)}
        onSave={async (limit) => {
          const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
          await new BudgetService().setMonthlyLimit(workspaceId, summary.month, limit);
          const refreshed = await new BudgetService().getBudgetStatus(workspaceId, summary.month);
          setBudget(refreshed);
        }}
      />

      {/* Trend */}
      <div className="rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Тренд расходов</div>
          <div className="opacity-70 text-sm">
            avg/day: {fmt(summary.avgExpensePerDay)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="opacity-80">
            <div className="text-sm opacity-70">Пик</div>
            <div className="font-medium">
              {summary.peakExpenseDay
                ? `${summary.peakExpenseDay.date} · -${fmt(summary.peakExpenseDay.expenseTotal)}`
                : "нет расходов"}
            </div>
          </div>

          <div className="text-black">
            <Sparkline values={summary.daily.map((d) => d.expenseTotal)} />
          </div>
        </div>

        <div className="text-xs opacity-60">
          * Показаны дневные суммы расходов за выбранный месяц
        </div>
      </div>


      {/* Top categories */}
      {summary.expenseTotal === 0 ? (
        <div className="rounded-2xl border p-6">
          <div className="font-semibold">Пока нет расходов</div>
          <div className="opacity-70 mt-1">
            Добавь первую трату — и здесь появится сводка.
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="font-semibold">Топ категории</div>
          {summary.topCategories.map((c) => (
            <div key={c.categoryId ?? "none"} className="flex justify-between">
              <div>{c.categoryName}</div>
              <div className="font-medium">-{c.total}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
