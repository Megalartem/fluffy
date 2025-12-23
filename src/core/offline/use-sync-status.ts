/**
 * Sync Status Hook
 *
 * React hook for managing sync status
 */

import { useState, useEffect, useCallback } from "react";

export interface SyncStatus {
  status: "idle" | "syncing" | "conflict" | "error" | "offline";
  progress: number; // 0-100
  message: string;
  lastSyncTime?: number;
  errorMessage?: string;
  conflictCount: number;
  pendingChanges: number;
}

export interface UseSyncStatusOptions {
  onStatusChange?: (status: SyncStatus) => void;
  onError?: (error: Error) => void;
  onConflict?: (count: number) => void;
}

const INITIAL_STATUS: SyncStatus = {
  status: "idle",
  progress: 0,
  message: "Готово",
  conflictCount: 0,
  pendingChanges: 0,
};

export function useSyncStatus(options?: UseSyncStatusOptions) {
  const [status, setStatus] = useState<SyncStatus>(INITIAL_STATUS);

  const updateStatus = useCallback(
    (updates: Partial<SyncStatus>) => {
      setStatus((prev) => {
        const newStatus = { ...prev, ...updates };
        options?.onStatusChange?.(newStatus);
        return newStatus;
      });
    },
    [options]
  );

  const startSync = useCallback(() => {
    updateStatus({
      status: "syncing",
      progress: 0,
      message: "Синхронизация...",
      errorMessage: undefined,
    });
  }, [updateStatus]);

  const completeSync = useCallback(
    (synced: number) => {
      updateStatus({
        status: "idle",
        progress: 100,
        message: `Синхронизировано ${synced} записей`,
        lastSyncTime: Date.now(),
      });
    },
    [updateStatus]
  );

  const setSyncing = useCallback(
    (progress: number) => {
      updateStatus({ status: "syncing", progress });
    },
    [updateStatus]
  );

  const setError = useCallback(
    (error: Error) => {
      updateStatus({
        status: "error",
        progress: 0,
        message: "Ошибка синхронизации",
        errorMessage: error.message,
      });
      options?.onError?.(error);
    },
    [updateStatus, options]
  );

  const setConflict = useCallback(
    (count: number) => {
      updateStatus({
        status: "conflict",
        progress: 0,
        message: `${count} конфликтов требуют разрешения`,
        conflictCount: count,
      });
      options?.onConflict?.(count);
    },
    [updateStatus, options]
  );

  const setOffline = useCallback(() => {
    updateStatus({
      status: "offline",
      message: "Вы не в сети. Изменения сохраняются локально.",
    });
  }, [updateStatus]);

  const reset = useCallback(() => {
    setStatus(INITIAL_STATUS);
  }, []);

  return {
    status,
    updateStatus,
    startSync,
    completeSync,
    setSyncing,
    setError,
    setConflict,
    setOffline,
    reset,
  };
}
