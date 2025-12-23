"use client";

import { useRef, useState, useEffect } from "react";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import type { Transaction } from "@/features/transactions/model/types";
import { useTransactionForm } from "@/features/transactions/hooks/use-transaction-form";
import { TransactionTypeToggle } from "./transaction-type-toggle";
import { TransactionForm } from "./transaction-form";
import { CategorySelector } from "./category-selector";
import { AmountPresets } from "./amount-presets";
import { TransactionFormActions } from "./transaction-form-actions";
import { DeleteConfirmModal } from "./delete-confirm-modal";

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
  transaction?: Transaction | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const amountRef = useRef<HTMLInputElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    type,
    setType,
    amount,
    setAmount,
    note,
    setNote,
    categoryId,
    setCategoryId,
    error,
    saving,
    categories,
    presets,
    save,
    deleteTransaction,
    applyPreset,
  } = useTransactionForm({ open, mode, transaction });

  /**
   * Focus amount input when sheet opens
   */
  useEffect(() => {
    if (open) {
      setTimeout(() => amountRef.current?.focus(), 0);
    }
  }, [open]);

  /**
   * Handle save
   */
  async function handleSave() {
    const success = await save();
    if (success) {
      onClose();
      onChanged();
    }
  }

  /**
   * Handle delete click
   */
  function handleDeleteClick() {
    setConfirmDeleteOpen(true);
  }

  /**
   * Handle delete confirmation
   */
  async function handleDeleteConfirmed() {
    const success = await deleteTransaction();
    if (success) {
      setConfirmDeleteOpen(false);
      onClose();
      onChanged();
    }
  }

  const title = mode === "create" ? "Добавить запись" : "Редактировать";

  return (
    <>
      <Modal open={open} title={title} onClose={onClose}>
        <div className="space-y-4">
          <TransactionTypeToggle value={type} onChange={setType} disabled={saving} />

          <TransactionForm
            ref={amountRef}
            amount={amount}
            onAmountChange={setAmount}
            note={note}
            onNoteChange={setNote}
            disabled={saving}
          />

          <CategorySelector
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            disabled={saving}
          />

          {mode === "create" && (
            <AmountPresets
              presets={presets}
              onSelect={applyPreset}
              disabled={saving}
            />
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <TransactionFormActions
            mode={mode}
            saving={saving}
            onSave={handleSave}
            onDelete={mode === "edit" ? handleDeleteClick : undefined}
            onClose={onClose}
          />
        </div>
      </Modal>

      {mode === "edit" && (
        <DeleteConfirmModal
          open={confirmDeleteOpen}
          saving={saving}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}
    </>
  );
}
