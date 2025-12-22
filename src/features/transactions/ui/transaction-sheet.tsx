"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/shared/ui/modal";
import type { Transaction, TransactionType } from "@/features/transactions/model/types";
import { WorkspaceService } from "@/shared/config/workspace";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import { TransactionService } from "@/features/transactions/model/service";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";
import type { Category } from "@/features/categories/model/types";
import { MetaService } from "@/shared/lib/storage/meta";

const LAST_TX_DEFAULTS_KEY = "last_transaction_defaults";

type LastTransactionDefaults = {
  type: "expense" | "income";
  categoryId: string | null;
  currency?: string;
};


type Mode = "create" | "edit";

export function TransactionSheet({
  open,
  mode,
  transaction,
  onClose,
  onChanged,
}: {
  open: boolean;
  mode: Mode;
  transaction?: Transaction | null; // required for edit
  onClose: () => void;
  onChanged: () => void; // reload list
}) {
  const amountRef = useRef<HTMLInputElement | null>(null);

  const service = useMemo(() => {
    return new TransactionService(new DexieTransactionsRepo(), new DexieSettingsRepo());
  }, []);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(""); // "" = none
  const [defaults, setDefaults] = useState<LastTransactionDefaults | null>(null);



  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      try {
        const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();

        const [cats, rawDefaults] = await Promise.all([
          new DexieCategoriesRepo().list(workspaceId),
          new MetaService().get(LAST_TX_DEFAULTS_KEY),
        ]);

        if (cancelled) return;

        setCategories(cats);

        let parsedDefaults: LastTransactionDefaults | null = null;
        if (rawDefaults) {
          try {
            parsedDefaults = JSON.parse(rawDefaults);
          } catch {
            parsedDefaults = null;
          }
        }
        setDefaults(parsedDefaults);

        // Init form
        if (mode === "edit" && transaction) {
          setType(transaction.type);
          setAmount(String(transaction.amount));
          setNote(transaction.note ?? "");
          setCategoryId(transaction.categoryId ?? "");
        } else {
          setType(parsedDefaults?.type ?? "expense");
          setAmount("");
          setNote("");
          setCategoryId(parsedDefaults?.categoryId ?? "");
        }

        // focus amount
        setTimeout(() => amountRef.current?.focus(), 0);
      } catch {
        if (cancelled) return;
        setCategories([]);
        setDefaults(null);

        // fallback init (create)
        if (mode === "edit" && transaction) {
          setType(transaction.type);
          setAmount(String(transaction.amount));
          setNote(transaction.note ?? "");
          setCategoryId(transaction.categoryId ?? "");
        } else {
          setType("expense");
          setAmount("");
          setNote("");
          setCategoryId("");
        }

        setTimeout(() => amountRef.current?.focus(), 0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, mode, transaction]);


  function parseAmount(input: string): number | null {
    const parsed = Number(input.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }

  async function handleSave() {
    setError(null);

    const parsedAmount = parseAmount(amount);
    if (!parsedAmount) {
      setError("Введите сумму больше нуля.");
      return;
    }

    setSaving(true);
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();

      if (mode === "create") {
        await service.addTransaction(workspaceId, {
          type,
          amount: parsedAmount,
          note: note.trim() ? note.trim() : null,
          categoryId: categoryId ? categoryId : null,
        });
        await new MetaService().set(
          LAST_TX_DEFAULTS_KEY,
          JSON.stringify({
            type,
            categoryId: categoryId ? categoryId : null,
          } satisfies LastTransactionDefaults)
        );
      } else {
        if (!transaction?.id) {
          setError("Не удалось сохранить: отсутствует id записи.");
          return;
        }
        await service.updateTransaction(workspaceId, {
          id: transaction.id,
          patch: {
            type,
            amount: parsedAmount,
            note: note.trim() ? note.trim() : null,
            categoryId: categoryId ? categoryId : null,
          },
        });
      }

      onClose();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!transaction?.id) return;

    setSaving(true);
    setError(null);
    try {
      const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();
      await service.deleteTransaction(workspaceId, transaction.id);

      setConfirmDeleteOpen(false);
      onClose();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "create" ? "Добавить запись" : "Редактировать";

  return (
    <>
      <Modal open={open} title={title} onClose={onClose}>
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
            <label className="text-sm opacity-70">Категория (опционально)</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-3"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? "Сохраняю…" : "Сохранить"}
          </button>

          {mode === "edit" ? (
            <button
              className="w-full rounded-2xl border py-3 font-semibold disabled:opacity-50"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={saving}
              type="button"
            >
              Удалить
            </button>
          ) : null}
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal
        open={confirmDeleteOpen}
        title="Удалить запись?"
        onClose={() => !saving && setConfirmDeleteOpen(false)}
      >
        <div className="space-y-4">
          <div className="opacity-80">
            Запись будет скрыта из списка. Это действие можно будет сделать обратимым позже через sync/архив, но в MVP
            удаление необратимо.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="rounded-2xl border py-3 font-semibold disabled:opacity-50"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={saving}
              type="button"
            >
              Отмена
            </button>
            <button
              className="rounded-2xl bg-black text-white py-3 font-semibold disabled:opacity-50"
              onClick={handleDeleteConfirmed}
              disabled={saving}
              type="button"
            >
              {saving ? "Удаляю…" : "Удалить"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
