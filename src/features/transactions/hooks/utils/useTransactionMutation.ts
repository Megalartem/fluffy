import * as React from "react";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/features/transactions/model/types";
import { transactionService } from "@/features/transactions/model/service";

export function useTransactionMutations(params: {
  workspaceId: string;
  refresh?: () => Promise<void> | void;
}) {
  const { workspaceId, refresh } = params;

  const [txSaving, setTxSaving] = React.useState(false);
  const [txError, setTxError] = React.useState<unknown>(null);

  const inFlightRef = React.useRef(false);

  const safeRefresh = React.useCallback(async () => {
    try {
      await refresh?.();
    } catch (e) {
      // refresh ошибки не должны ломать UX сохранения
      console.warn("[useTransactionMutations] refresh failed", e);
    }
  }, [refresh]);

  const txCreate = React.useCallback(
    async (input: CreateTransactionInput) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setTxSaving(true);
      setTxError(null);

      try {
        const tx = await transactionService.addTransaction(workspaceId, input);
        await safeRefresh();
        return tx;
      } catch (e) {
        setTxError(e);
        throw e;
      } finally {
        inFlightRef.current = false;
        setTxSaving(false);
      }
    },
    [workspaceId, safeRefresh]
  );

  const txUpdate = React.useCallback(
    async (input: UpdateTransactionInput) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setTxSaving(true);
      setTxError(null);

      try {
        const tx = await transactionService.updateTransaction(workspaceId, input);
        await safeRefresh();
        return tx;
      } catch (e) {
        setTxError(e);
        throw e;
      } finally {
        inFlightRef.current = false;
        setTxSaving(false);
      }
    },
    [workspaceId, safeRefresh]
  );

  const txRemove = React.useCallback(
    async (id: string) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setTxSaving(true);
      setTxError(null);

      try {
        await transactionService.deleteTransaction(workspaceId, id);
        await safeRefresh();
      } catch (e) {
        setTxError(e);
        throw e;
      } finally {
        inFlightRef.current = false;
        setTxSaving(false);
      }
    },
    [workspaceId, safeRefresh]
  );

  return { txCreate, txUpdate, txRemove, txSaving, txError, clearError: () => setTxError(null) };
}