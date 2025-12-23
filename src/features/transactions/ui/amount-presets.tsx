/**
 * AmountPresets - Quick amount buttons from recent transactions
 */

import type { Transaction } from "@/features/transactions/model/types";

interface AmountPresetsProps {
  presets: Transaction[];
  onSelect: (amount: number) => void;
  disabled?: boolean;
}

export function AmountPresets({
  presets,
  onSelect,
  disabled = false,
}: AmountPresetsProps) {
  if (presets.length === 0) {
    return null;
  }

  // Get unique amounts (last 5)
  const uniqueAmounts = Array.from(
    new Set(presets.map((p) => p.amount))
  ).slice(0, 5);

  return (
    <div>
      <label className="text-sm opacity-70">Быстрый выбор</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {uniqueAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onSelect(amt)}
            disabled={disabled}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {amt.toLocaleString("ru-RU")}
          </button>
        ))}
      </div>
    </div>
  );
}
