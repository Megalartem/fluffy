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
import Link from "next/link";
import { GoalsService } from "@/features/goals/model/service";
import type { Goal } from "@/features/goals/model/types";
import { GoalMiniCard } from "@/features/goals/ui/goal-mini-card";
import { GoalQuickAddSheet } from "@/features/goals/ui/goal-quick-add-sheet";
import { NotificationsService } from "@/features/notifications/model/service";
import type { Notice } from "@/features/notifications/model/types";
import { NotificationsBell } from "@/features/notifications/ui/notifications-bell";



function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}


export default function DashboardPage() {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [savingGoalId, setSavingGoalId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);



  async function load() {
    setLoading(true);
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();

      const [data, goals] = await Promise.all([
        new DashboardService().getMonthlySummary(workspaceId, period),
        new GoalsService().list(workspaceId),
      ]);

      const budgetStatus = await new BudgetService().getBudgetStatus(workspaceId, data.month);

      const noticeList = await new NotificationsService().getDashboardNotices({
        workspaceId,
        month: data.month,
        budget: budgetStatus,
        goals,
      });

      setSummary(data);
      setBudget(budgetStatus);
      setGoals(goals);
      setNotices(noticeList);
    } finally {
      setLoading(false);
    }
  }

  async function saveQuickAdd(amount: number) {
    if (!selectedGoal) return;

    setSavingGoalId(selectedGoal.id);
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      await new GoalsService().addToGoal(workspaceId, selectedGoal.id, amount);

      const goalsList = await new GoalsService().list(workspaceId);
      setGoals(goalsList);

      setQuickAddOpen(false);
      setSelectedGoal(null);
    } finally {
      setSavingGoalId(null);
    }
  }

  function openQuickAdd(goal: Goal) {
    if (savingGoalId) return;
    setSelectedGoal(goal);
    setQuickAddOpen(true);
  }

  function closeQuickAdd() {
    if (savingGoalId) return;
    setQuickAddOpen(false);
    setSelectedGoal(null);
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

  const topGoals = [...goals]
    .filter((g) => !g.deletedAt)
    .sort(goalSort)
    .slice(0, 3);


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Обзор · {summary.label}</h1>

        <div className="flex items-center gap-2">
          {/* period toggle (если есть) */}
          <NotificationsBell
            notices={notices}
            onDismiss={async (n) => {
              await new NotificationsService().dismissNotice(n.dismissKey, n.dismissValue);
              setNotices((prev) => prev.filter((x) => x.id !== n.id));
            }}
          />
        </div>
      </div>



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

      <div className="rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Цели</div>
          <Link className="text-sm underline opacity-80" href="/goals">
            Все цели
          </Link>
        </div>

        {topGoals.length === 0 ? (
          <div className="opacity-70 text-sm">
            Пока нет целей. Добавь цель — и прогресс будет виден прямо здесь.
            <div className="mt-2">
              <Link className="underline" href="/goals">
                Создать цель
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {topGoals.map((g) => (
              <GoalMiniCard
                key={g.id}
                goal={g}
                onQuickAddClick={openQuickAdd}
                isSaving={savingGoalId === g.id}
              />
            ))}


          </div>
        )}
      </div>


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


      <GoalQuickAddSheet
        open={quickAddOpen}
        goal={selectedGoal}
        isSaving={Boolean(savingGoalId)}
        onClose={closeQuickAdd}
        onSave={saveQuickAdd}
      />

    </div>
  );
}

function goalProgress(g: { currentAmount: number; targetAmount: number }) {
  if (!Number.isFinite(g.targetAmount) || g.targetAmount <= 0) return 0;
  return Math.min(1, g.currentAmount / g.targetAmount);
}

function goalSort(a: any, b: any) {
  const aHasDeadline = Boolean(a.deadline);
  const bHasDeadline = Boolean(b.deadline);

  // 1) Дедлайн есть → выыше
  if (aHasDeadline !== bHasDeadline) return aHasDeadline ? -1 : 1;

  // 2) Оба с дедлайном → ближайший выше
  if (aHasDeadline && bHasDeadline) {
    const cmp = String(a.deadline).localeCompare(String(b.deadline));
    if (cmp !== 0) return cmp;
  }

  // 3) Без дедлайна (или одинаковые дедлайны) → меньший прогресс выше
  const ap = goalProgress(a);
  const bp = goalProgress(b);
  if (ap !== bp) return ap - bp;

  // 4) Стабильность
  return String(a.title).localeCompare(String(b.title));
}
