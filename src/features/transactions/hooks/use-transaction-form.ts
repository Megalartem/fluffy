/**
 * useTransactionForm - Business logic for transaction form
 *
 * Handles:
 * - Form state management
 * - Data loading (categories, defaults, presets)
 * - Validation
 * - Save/delete operations
 * - MetaService integration for defaults
 */

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/shared/config/workspace-context";
import type { Transaction, TransactionType } from "@/features/transactions/model/types";
import type { Category } from "@/features/categories/model/types";
import { DexieSettingsRepo } from "@/features/settings/api/repo.dexie";
import { DexieTransactionsRepo } from "@/features/transactions/api/repo.dexie";
import { TransactionService } from "@/features/transactions/model/service";
import { DexieCategoriesRepo } from "@/features/categories/api/repo.dexie";
import { MetaService } from "@/shared/lib/storage/meta";
import { META_KEYS } from "@/shared/constants/meta-keys";

type LastTransactionDefaults = {
  type: "expense" | "income";
  categoryId: string | null;
  currency?: string;
};

type Mode = "create" | "edit";

interface UseTransactionFormProps {
  open: boolean;
  mode: Mode;
  transaction?: Transaction | null;
}

export function useTransactionForm({ open, mode, transaction }: UseTransactionFormProps) {
  const { workspaceId } = useWorkspace();

  const service = useMemo(
    () => new TransactionService(new DexieTransactionsRepo(), new DexieSettingsRepo()),
    []
  );

  // Form state
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [defaults, setDefaults] = useState<LastTransactionDefaults | null>(null);
  const [presets, setPresets] = useState<Transaction[]>([]);

  /**
   * Load data when sheet opens
   */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        const [cats, rawDefaults, recent] = await Promise.all([
          new DexieCategoriesRepo().list(workspaceId),
          new MetaService().get(META_KEYS.LAST_TRANSACTION_DEFAULTS),
          new DexieTransactionsRepo().listRecent(workspaceId, { type: "expense", limit: 5 }),
        ]);

        if (cancelled) return;

        setCategories(cats);
        setPresets(recent);

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
      } catch {
        if (cancelled) return;
        setCategories([]);
        setDefaults(null);
        setPresets([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, mode, transaction, workspaceId]);

  /**
   * Reset form when closed
   */
  useEffect(() => {
    if (!open) {
      setError(null);
      setSaving(false);
    }
  }, [open]);

  /**
   * Parse amount string to number
   */
  function parseAmount(raw: string): number | null {
    const cleaned = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  /**
   * Save transaction (create or update)
   */
  async function save(): Promise<boolean> {
    setError(null);

    const parsedAmount = parseAmount(amount);
    if (!parsedAmount) {
      setError("Введите сумму больше нуля.");
      return false;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        await service.addTransaction(workspaceId, {
          type,
          amount: parsedAmount,
          note: note.trim() ? note.trim() : null,
          categoryId: categoryId ? categoryId : null,
        });

        // Save defaults
        await new MetaService().set(
          META_KEYS.LAST_TRANSACTION_DEFAULTS,
          JSON.stringify({
            type,
            categoryId: categoryId ? categoryId : null,
          } satisfies LastTransactionDefaults)
        );
      } else {
        if (!transaction?.id) {
          setError("Не удалось сохранить: отсутствует id записи.");
          return false;
        }

        await service.updateTransaction(
          workspaceId,
          transaction.id,
          {
            type,
            amount: parsedAmount,
            note: note.trim() ? note.trim() : null,
            categoryId: categoryId ? categoryId : null,
          },
          {
            id: transaction.id,
            patch: {
              type,
              amount: parsedAmount,
              note: note.trim() ? note.trim() : null,
              categoryId: categoryId ? categoryId : null,
            },
          }
        );
      }

      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
      return false;
    } finally {
      setSaving(false);
    }
  }

  /**
   * Delete transaction (soft delete)
   */
  async function deleteTransaction(): Promise<boolean> {
    if (!transaction?.id) return false;

    setSaving(true);
    setError(null);

    try {
      await service.deleteTransaction(workspaceId, transaction.id);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
      return false;
    } finally {
      setSaving(false);
    }
  }

  /**
   * Apply preset amount
   */
  function applyPreset(presetAmount: number) {
    setAmount(String(presetAmount));
  }

  return {
    // Form state
    type,
    setType,
    amount,
    setAmount,
    note,
    setNote,
    categoryId,
    setCategoryId,

    // UI state
    error,
    saving,

    // Data
    categories,
    defaults,
    presets,

    // Actions
    save,
    deleteTransaction,
    applyPreset,
  };
}
