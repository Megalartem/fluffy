"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { Modal } from "@/shared/ui/modal";
import { GoalsService } from "@/features/goals/model/service";
import type { Goal } from "@/features/goals/model/types";
import { GoalQuickAddSheet } from "@/features/goals/ui/goal-quick-add-sheet";


function fmt(n: number) {
    return n.toLocaleString("ru-RU");
}

export default function GoalsPage() {
    const service = useMemo(() => new GoalsService(), []);
    const [items, setItems] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [savingGoalId, setSavingGoalId] = useState<string | null>(null);

    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);


    async function load() {
        setLoading(true);
        const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
        const list = await service.list(workspaceId);
        setItems(list);
        setLoading(false);
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

    async function saveQuickAdd(amount: number) {
        if (!selectedGoal) return;

        setSavingGoalId(selectedGoal.id);
        try {
            const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
            await service.addToGoal(workspaceId, selectedGoal.id, amount);
            await load();

            setQuickAddOpen(false);
            setSelectedGoal(null);
        } finally {
            setSavingGoalId(null);
        }
    }


    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function createGoal() {
        setError(null);
        const t = title.trim();
        const n = Number(target.replace(",", "."));
        if (!t) return setError("Название обязательно");
        if (!Number.isFinite(n) || n <= 0) return setError("Цель должна быть больше нуля");

        const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
        await service.create(workspaceId, { title: t, targetAmount: n });

        setCreateOpen(false);
        setTitle("");
        setTarget("");
        await load();
    }

    async function quickAdd(goal: Goal) {
        const raw = prompt(`Пополнить "${goal.title}" на сумму:`, "1000");
        if (!raw) return;
        const n = Number(raw.replace(",", "."));
        if (!Number.isFinite(n) || n <= 0) return;

        const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
        await service.addToGoal(workspaceId, goal.id, n);
        await load();
    }

    async function remove(goal: Goal) {
        const ok = confirm(`Архивировать цель "${goal.title}"?`);
        if (!ok) return;
        const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
        await service.delete(workspaceId, goal.id);
        await load();
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Цели</h1>
                <button className="rounded-2xl bg-black text-white px-4 py-2 font-semibold" onClick={() => setCreateOpen(true)}>
                    Добавить
                </button>
            </div>

            {loading ? <div>Loading…</div> : null}

            {!loading && items.length === 0 ? (
                <div className="rounded-2xl border p-6">
                    <div className="font-semibold">Пока нет целей</div>
                    <div className="opacity-70 mt-1">Создай цель — и прогресс будет виден сразу.</div>
                </div>
            ) : null}

            {!loading && items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((g) => {
                        const progress = g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0;
                        const pct = Math.round(progress * 100);

                        return (
                            <div key={g.id} className="rounded-2xl border p-4 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="font-semibold">{g.title}</div>
                                        <div className="text-sm opacity-70">
                                            {fmt(g.currentAmount)} / {fmt(g.targetAmount)} {g.currency} · {pct}%
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="rounded-xl border px-3 py-2 disabled:opacity-50"
                                            onClick={() => openQuickAdd(g)}
                                            type="button"
                                            disabled={savingGoalId === g.id}
                                        >
                                            {savingGoalId === g.id ? "Сохраняю…" : "+ Пополнить"}
                                        </button>

                                        <button className="rounded-xl border px-3 py-2" onClick={() => remove(g)} type="button">
                                            Архив
                                        </button>
                                    </div>
                                </div>

                                <div className="h-3 rounded-full bg-black/10 overflow-hidden">
                                    <div className="h-3 bg-black" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <Modal open={createOpen} title="Новая цель" onClose={() => setCreateOpen(false)}>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm opacity-70">Название</label>
                        <input
                            className="mt-1 w-full rounded-xl border px-3 py-3"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="например: Подушка безопасности"
                        />
                    </div>

                    <div>
                        <label className="text-sm opacity-70">Целевая сумма</label>
                        <input
                            inputMode="decimal"
                            className="mt-1 w-full rounded-xl border px-3 py-3"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="например: 100000"
                        />
                    </div>

                    {error ? <div className="text-sm text-red-600">{error}</div> : null}

                    <button className="w-full rounded-2xl bg-black text-white py-3 font-semibold" onClick={createGoal}>
                        Создать
                    </button>
                </div>
            </Modal>

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
