"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceService } from "@/shared/config/workspace";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import type { Transaction } from "@/features/transactions/model/types";
import { AddTransactionSheet } from "@/features/transactions/ui/add-transaction-sheet";

type State =
  | { status: "loading" }
  | { status: "ready"; items: Transaction[] }
  | { status: "error"; message: string };

export default function TransactionsPage() {
  const repo = useMemo(() => new DexieTransactionsRepo(), []);
  const [state, setState] = useState<State>({ status: "loading" });
  const [open, setOpen] = useState(false);

  async function load() {
    setState({ status: "loading" });
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      const items = await repo.list(workspaceId, { limit: 50 });
      setState({ status: "ready", items });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Транзакции</h1>
        <button className="rounded-xl border px-3 py-2" onClick={load} type="button">
          Обновить
        </button>
      </div>

      {state.status === "loading" ? <div>Loading…</div> : null}

      {state.status === "error" ? (
        <div className="rounded-2xl border p-4">
          <div className="font-medium">Ошибка</div>
          <div className="opacity-70">{state.message}</div>
          <button className="mt-3 rounded-xl border px-3 py-2" onClick={load} type="button">
            Повторить
          </button>
        </div>
      ) : null}

      {state.status === "ready" && state.items.length === 0 ? (
        <div className="rounded-2xl border p-6">
          <div className="text-lg font-semibold">Пока нет записей</div>
          <div className="opacity-70 mt-1">Добавь первую трату — это займёт пару секунд.</div>
          <button className="mt-4 rounded-2xl bg-black text-white px-4 py-3 font-semibold" onClick={() => setOpen(true)}>
            Добавить
          </button>
        </div>
      ) : null}

      {state.status === "ready" && state.items.length > 0 ? (
        <div className="space-y-2">
          {state.items.map((t) => (
            <div key={t.id} className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.note ?? "Без заметки"}</div>
                <div className="text-sm opacity-70">{t.date} · {t.type}</div>
              </div>
              <div className="font-semibold">
                {t.type === "expense" ? "-" : "+"}{t.amount} {t.currency}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* FAB */}
      <button
        className="fixed right-5 bottom-5 rounded-full w-14 h-14 bg-black text-white text-2xl shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Добавить запись"
        type="button"
      >
        +
      </button>

      <AddTransactionSheet open={open} onClose={() => setOpen(false)} onCreated={load} />
    </div>
  );
}
