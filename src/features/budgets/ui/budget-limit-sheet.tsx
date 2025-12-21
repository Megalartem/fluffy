"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/shared/ui/modal";

export function BudgetLimitSheet({
  open,
  currency,
  initialValue,
  onClose,
  onSave,
}: {
  open: boolean;
  currency: string;
  initialValue: number | null;
  onClose: () => void;
  onSave: (limit: number) => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(initialValue ? String(initialValue) : "");
    setError(null);
    setSaving(false);
    setTimeout(() => ref.current?.focus(), 0);
  }, [open, initialValue]);

  async function handleSave() {
    setError(null);
    const n = Number(value.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setError("Введите число больше нуля.");
      return;
    }

    setSaving(true);
    try {
      await onSave(n);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="Лимит на месяц" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm opacity-70">Сумма ({currency})</label>
          <input
            ref={ref}
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border px-3 py-3 text-lg"
            placeholder="например: 30000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
        </div>

        <button
          className="w-full rounded-2xl bg-black text-white py-3 font-semibold disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving ? "Сохраняю…" : "Сохранить"}
        </button>
      </div>
    </Modal>
  );
}
