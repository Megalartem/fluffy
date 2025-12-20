"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/shared/ui/modal";
import type { TransactionType } from "@/features/transactions/model/types";
import { WorkspaceService } from "@/shared/config/workspace";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import { TransactionService } from "@/features/transactions/model/service";


export function AddTransactionSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // чтобы перезагрузить список
}) {
  const amountRef = useRef<HTMLInputElement | null>(null);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const service = useMemo(() => {
    return new TransactionService(new DexieTransactionsRepo(), new DexieSettingsRepo());
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => amountRef.current?.focus(), 0);
    } else {
      setAmount("");
      setNote("");
      setType("expense");
      setError(null);
      setSaving(false);
    }
  }, [open]);

  async function onSave() {
    setError(null);

    const parsed = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Введите сумму больше нуля.");
      return;
    }

    setSaving(true);
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      await service.addTransaction(workspaceId, {
        type,
        amount: parsed,
        note: note.trim() ? note.trim() : null,
      });

      onClose();
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Добавить запись" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm opacity-70">Сумма</label>
          <input
            ref={amountRef}
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border px-3 py-3 text-lg"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
        </div>

        <div>
          <label className="text-sm opacity-70">Тип</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              className={`rounded-xl border py-2 ${type === "expense" ? "font-semibold" : "opacity-70"}`}
              onClick={() => setType("expense")}
              type="button"
            >
              Расход
            </button>
            <button
              className={`rounded-xl border py-2 ${type === "income" ? "font-semibold" : "opacity-70"}`}
              onClick={() => setType("income")}
              type="button"
            >
              Доход
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm opacity-70">Заметка (опционально)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-3"
            placeholder="например: кофе"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          className="w-full rounded-2xl bg-black text-white py-3 font-semibold disabled:opacity-50"
          onClick={onSave}
          disabled={saving}
          type="button"
        >
          {saving ? "Сохраняю…" : "Сохранить"}
        </button>
      </div>
    </Modal>
  );
}
