/**
 * TransactionForm - Core form fields for transaction
 */

import { forwardRef } from "react";

interface TransactionFormProps {
  amount: string;
  onAmountChange: (value: string) => void;
  note: string;
  onNoteChange: (value: string) => void;
  disabled?: boolean;
}

export const TransactionForm = forwardRef<HTMLInputElement, TransactionFormProps>(
  function TransactionForm(
    { amount, onAmountChange, note, onNoteChange, disabled = false },
    amountRef
  ) {
    return (
      <>
        <div>
          <label className="text-sm opacity-70">Сумма</label>
          <input
            ref={amountRef}
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border px-3 py-3 text-lg"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="text-sm opacity-70">Заметка (необязательно)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-3"
            placeholder="Например: продукты"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </>
    );
  }
);
