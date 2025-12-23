"use client";

import { useState } from "react";
import Link from "next/link";
import { fmt } from "@/shared/lib/formatter";
import { Sparkline } from "@/features/dashboard/ui/sparkline";
import { BudgetCard } from "@/features/budgets/ui/budget-card";
import { BudgetLimitSheet } from "@/features/budgets/ui/budget-limit-sheet";
import { GoalMiniCard } from "@/features/goals/ui/goal-mini-card";
import { GoalQuickAddSheet } from "@/features/goals/ui/goal-quick-add-sheet";
import { NotificationsBell } from "@/features/notifications/ui/notifications-bell";
import { SyncStatusBadge } from "@/features/sync/ui";
import { useSyncStatus } from "@/features/sync/hooks/use-sync-status";
import type { Goal } from "@/features/goals/model/types";
import { useDashboardData } from "@/features/dashboard/model/use-dashboard-data";
import { PeriodToggle } from "@/features/dashboard/ui/period-toggle";


export default function DashboardPage() {
  const [period, setPeriod] = useState<"current" | "previous">("current");
  const { loading, summary, budget, goals, notices, setBudgetLimit, dismissNotice, addToGoal } =
    useDashboardData(period);
  const { syncState } = useSyncStatus();

  const [budgetOpen, setBudgetOpen] = useState(false);
  const [savingGoalId, setSavingGoalId] = useState<string | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const getSyncStatus = () => {
    if (syncState.conflicts > 0) return "conflict" as const;
    if (!syncState.isOnline) return "idle" as const;
    if (syncState.isSyncing) return "syncing" as const;
    if (syncState.failedChanges > 0) return "error" as const;
    if (syncState.lastSyncTime) return "synced" as const;
    return "idle" as const;
  };

  async function saveQuickAdd(amount: number) {
    if (!selectedGoal) return;
    setSavingGoalId(selectedGoal.id);
    try {
      await addToGoal(selectedGoal.id, amount);
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
          <SyncStatusBadge 
            status={getSyncStatus()} 
            showLabel={false}
          />
          <NotificationsBell notices={notices} onDismiss={dismissNotice} />
        </div>
      </div>

      <PeriodToggle value={period} onChange={setPeriod} />

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
          {fmt(summary.balance)}
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
          await setBudgetLimit(limit);
        }}
      />

      {/* Top goals */}
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
