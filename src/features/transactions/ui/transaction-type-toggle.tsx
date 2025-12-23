/**
 * TransactionTypeToggle - Toggle between expense and income
 */

import type { TransactionType } from "@/features/transactions/model/types";

interface TransactionTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  disabled?: boolean;
}

export function TransactionTypeToggle({
  value,
  onChange,
  disabled = false,
}: TransactionTypeToggleProps) {
  return (
    <div className="flex rounded-xl border p-1">
      <button
        type="button"
        onClick={() => onChange("expense")}
        disabled={disabled}
        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
          value === "expense"
            ? "bg-red-500 text-white"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Расход
      </button>
      <button
        type="button"
        onClick={() => onChange("income")}
        disabled={disabled}
        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
          value === "income"
            ? "bg-green-500 text-white"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        Доход
      </button>
    </div>
  );
}
