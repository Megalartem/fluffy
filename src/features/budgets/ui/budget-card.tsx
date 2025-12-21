"use client";

import type { BudgetStatus } from "@/features/budgets/model/types";

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export function BudgetCard({
  status,
  onSetLimit,
}: {
  status: BudgetStatus;
  onSetLimit: () => void;
}) {
  const limit = status.limit;
  const pct = limit ? Math.round(status.progress * 100) : 0;

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Бюджет месяца</div>
        <button className="rounded-xl border px-3 py-2" onClick={onSetLimit} type="button">
          {limit ? "Изменить" : "Задать"}
        </button>
      </div>

      {limit ? (
        <>
          <div className="flex items-baseline justify-between">
            <div className="text-sm opacity-70">Потрачено</div>
            <div className="font-medium">
              {fmt(status.spent)} / {fmt(limit)} {status.currency} · {pct}%
            </div>
          </div>

          <div className="h-3 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-3 bg-black"
              style={{ width: `${pct}%` }}
            />
          </div>

          {status.threshold === "warn80" ? (
            <div className="text-sm">
              ⚠️ Ты близко к лимиту — уже {pct}%.
            </div>
          ) : null}

          {status.threshold === "limit100" ? (
            <div className="text-sm">
              🚨 Лимит достигнут — {pct}%. Проверь расходы.
            </div>
          ) : null}
        </>
      ) : (
        <div className="opacity-70">
          Лимит не задан. Укажи сумму — и мы покажем прогресс.
        </div>
      )}
    </div>
  );
}
