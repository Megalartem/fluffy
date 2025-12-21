"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/shared/ui/modal";
import type { Goal } from "@/features/goals/model/types";

export function GoalQuickAddSheet({
  open,
  goal,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  goal: Goal | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValue("");
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, goal?.id]);

  async function handleSave() {
    setError(null);
    const n = Number(value.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setError("Введите сумму больше нуля.");
      return;
    }
    await onSave(n);
  }

  const title = goal ? `Пополнить: ${goal.title}` : "Пополнить цель";

  return (
    <Modal open={open} title={title} onClose={() => !isSaving && onClose()}>
      <div className="space-y-4">
        <div>
          <label className="text-sm opacity-70">Сумма</label>
          <input
            ref={inputRef}
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border px-3 py-3 text-lg"
            placeholder="например: 1000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSaving}
          />
          {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
        </div>

        <button
          className="w-full rounded-2xl bg-black text-white py-3 font-semibold disabled:opacity-50"
          onClick={handleSave}
          disabled={isSaving || !goal}
          type="button"
        >
          {isSaving ? "Сохраняю…" : "Сохранить"}
        </button>
      </div>
    </Modal>
  );
}
