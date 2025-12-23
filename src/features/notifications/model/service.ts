import { db, ensureDbInitialized, nowIso } from "@/shared/lib/storage/db";
import type { Notice } from "./types";
import type { BudgetStatus } from "@/features/budgets/model/types";
import type { Goal } from "@/features/goals/model/types";

type BudgetNotified = "none" | "warn80" | "limit100";

function budgetRank(v: BudgetNotified): number {
  if (v === "warn80") return 1;
  if (v === "limit100") return 2;
  return 0;
}

function budgetMetaKey(workspaceId: string, month: string) {
  return `budget_notified_${workspaceId}_${month}`;
}

function goalMetaKey(workspaceId: string, goalId: string) {
  return `goal_notified_${workspaceId}_${goalId}`;
}

async function metaGet(key: string): Promise<string | null> {
  await ensureDbInitialized();
  const row = await db.meta.get(key);
  return row?.value ?? null;
}

async function metaSet(key: string, value: string): Promise<void> {
  await ensureDbInitialized();
  await db.meta.put({ key, value, updatedAt: nowIso() });
}

async function metaDelete(key: string): Promise<void> {
  await ensureDbInitialized();
  await db.meta.delete(key);
}

export class NotificationsService {
  /**
   * Возвращает список уведомлений, которые стоит показать на Dashboard.
   * В meta мы пишем только при dismiss — чтобы пользователь точно увидел.
   */
  async getDashboardNotices(params: {
    workspaceId: string;
    month: string;
    budget: BudgetStatus | null;
    goals: Goal[];
  }): Promise<Notice[]> {
    const { workspaceId, month, budget, goals } = params;
    const notices: Notice[] = [];

    // 1) Budget thresholds
    if (budget && budget.limit && budget.limit > 0) {
      const current: BudgetNotified =
        budget.threshold === "limit100"
          ? "limit100"
          : budget.threshold === "warn80"
            ? "warn80"
            : "none";
      
      if (current !== "none") {
        const key = budgetMetaKey(workspaceId, month);
        const prevRaw = (await metaGet(key)) as BudgetNotified | null;
        const prev: BudgetNotified = prevRaw === "warn80" || prevRaw === "limit100" ? prevRaw : "none";

        // Показываем только если есть "повышение" (none->warn80 или warn80->limit100)
        if (budgetRank(current) > budgetRank(prev)) {
          notices.push({
            id: `budget:${month}:${current}`,
            level: current === "limit100" ? "danger" : "warn",
            title: current === "limit100" ? "Лимит бюджета достигнут" : "Ты близко к лимиту бюджета",
            message:
              current === "limit100"
                ? `Расходы достигли 100% лимита за ${month}.`
                : `Расходы достигли 80% лимита за ${month}.`,
            dismissKey: key,
            dismissValue: current, // фиксируем самый высокий достигнутый порог
          });
        }
      }
    }

    // 2) Goals reached
    for (const g of goals) {
      if (g.deletedAt) continue;
      if (!(g.targetAmount > 0)) continue;

      const reached = g.currentAmount >= g.targetAmount;
      if (!reached) continue;

      const key = goalMetaKey(workspaceId, g.id);
      const prev = await metaGet(key);

      // Показываем один раз на цель
      if (prev !== "reached") {
        notices.push({
          id: `goal:${g.id}:reached`,
          level: "info",
          title: "Цель достигнута 🎉",
          message: `Ты закрыл(а) цель “${g.title}”. Можно зафиксировать новую или повысить планку.`,
          dismissKey: key,
          dismissValue: "reached",
        });
      }
    }

    return notices;
  }

  async dismissNotice(dismissKey: string, dismissValue: string): Promise<void> {
    await metaSet(dismissKey, dismissValue);
  }

  /**
   * Удаляет meta-флаг для бюджетных уведомлений за конкретный месяц.
   * Полезно для дев/отладки или если нужно «переиграть» пороги.
   */
  async resetBudgetNotice(workspaceId: string, month: string): Promise<void> {
    await metaDelete(budgetMetaKey(workspaceId, month));
  }

  /**
   * Удаляет meta-флаг для уведомления о достижении конкретной цели.
   */
  async resetGoalNotice(workspaceId: string, goalId: string): Promise<void> {
    await metaDelete(goalMetaKey(workspaceId, goalId));
  }

  /**
   * Универсальный метод: удалить произвольный meta-ключ уведомления.
   * Используй аккуратно (например, для dev UI/консоли).
   */
  async deleteNoticeMetaKey(key: string): Promise<void> {
    await metaDelete(key);
  }
}
