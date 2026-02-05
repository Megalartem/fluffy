"use client";

import { useMemo, useCallback, useState, ReactNode } from "react";
import {
  AppStateContext,
  createDefaultAppState,
  type AppState,
  type AppStateActions,
  type AppStateContextValue,
} from "./app-state";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";

/**
 * AppStateProvider - manages global application state
 *
 * Provides dashboard data, UI state, error handling, and loading states
 * Uses React hooks (useState, useCallback) for state management
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const { workspaceId } = useWorkspace();
  const [state, setState] = useState<AppState>(() =>
    createDefaultAppState(workspaceId)
  );

  /**
   * Dashboard actions
   */
  const setDashboardPeriod = useCallback((period: "current" | "previous") => {
    setState((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, period },
    }));
  }, []);

  const setDashboardLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, loading },
    }));
  }, []);

  const setDashboardError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, error },
    }));
  }, []);

  const updateDashboardData = useCallback(
    (data: Partial<AppState["dashboard"]>) => {
      setState((prev) => ({
        ...prev,
        dashboard: { ...prev.dashboard, ...data },
      }));
    },
    []
  );

  /**
   * UI actions
   */
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: { ...prev.ui, sidebarOpen: !prev.ui.sidebarOpen },
    }));
  }, []);

  const openModal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        modalsOpen: new Set(prev.ui.modalsOpen).add(id),
      },
    }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setState((prev) => {
      const newSet = new Set(prev.ui.modalsOpen);
      newSet.delete(id);
      return {
        ...prev,
        ui: { ...prev.ui, modalsOpen: newSet },
      };
    });
  }, []);

  const openSheet = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        sheetsOpen: new Set(prev.ui.sheetsOpen).add(id),
      },
    }));
  }, []);

  const closeSheet = useCallback((id: string) => {
    setState((prev) => {
      const newSet = new Set(prev.ui.sheetsOpen);
      newSet.delete(id);
      return {
        ...prev,
        ui: { ...prev.ui, sheetsOpen: newSet },
      };
    });
  }, []);

  const resetUI = useCallback(() => {
    setState((prev) => ({
      ...prev,
      ui: {
        sidebarOpen: true,
        modalsOpen: new Set(),
        sheetsOpen: new Set(),
      },
    }));
  }, []);

  /**
   * Error actions
   */
  const setGlobalError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, global: error },
    }));
  }, []);

  const setContextualError = useCallback((context: string, error: string | null) => {
    setState((prev) => {
      const contextual = new Map(prev.errors.contextual);
      if (error) {
        contextual.set(context, error);
      } else {
        contextual.delete(context);
      }
      return {
        ...prev,
        errors: { ...prev.errors, contextual },
      };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: { global: null, contextual: new Map() },
    }));
  }, []);

  /**
   * Loading actions
   */
  const startOperation = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      loading: {
        ...prev.loading,
        operations: new Set(prev.loading.operations).add(id),
      },
    }));
  }, []);

  const endOperation = useCallback((id: string) => {
    setState((prev) => {
      const newSet = new Set(prev.loading.operations);
      newSet.delete(id);
      return {
        ...prev,
        loading: { ...prev.loading, operations: newSet },
      };
    });
  }, []);

  const isOperationPending = useCallback((id: string) => {
    return state.loading.operations.has(id);
  }, [state.loading.operations]);

  /**
   * Cache actions
   */
  const markNoticeSeen = useCallback((noticeId: string) => {
    setState((prev) => ({
      ...prev,
      cache: {
        ...prev.cache,
        lastSeenNoticeIds: new Set(prev.cache.lastSeenNoticeIds).add(noticeId),
      },
    }));
  }, []);

  const dismissNotice = useCallback((noticeId: string) => {
    setState((prev) => ({
      ...prev,
      cache: {
        ...prev.cache,
        dismissedNoticeIds: new Set(prev.cache.dismissedNoticeIds).add(noticeId),
      },
    }));
  }, []);

  const isNoticeDismissed = useCallback((noticeId: string) => {
    return state.cache.dismissedNoticeIds.has(noticeId);
  }, [state.cache.dismissedNoticeIds]);

  const clearNoticeCache = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cache: {
        ...prev.cache,
        lastSeenNoticeIds: new Set(),
        dismissedNoticeIds: new Set(),
      },
    }));
  }, []);

  /**
   * Full reset
   */
  const reset = useCallback(() => {
    setState(createDefaultAppState(workspaceId));
  }, [workspaceId]);

  /**
   * Create actions object
   */
  const actions: AppStateActions = useMemo(
    () => ({
      setDashboardPeriod,
      setDashboardLoading,
      setDashboardError,
      updateDashboardData,
      toggleSidebar,
      openModal,
      closeModal,
      openSheet,
      closeSheet,
      resetUI,
      setGlobalError,
      setContextualError,
      clearErrors,
      startOperation,
      endOperation,
      isOperationPending,
      markNoticeSeen,
      dismissNotice,
      isNoticeDismissed,
      clearNoticeCache,
      reset,
    }),
    [
      setDashboardPeriod,
      setDashboardLoading,
      setDashboardError,
      updateDashboardData,
      toggleSidebar,
      openModal,
      closeModal,
      openSheet,
      closeSheet,
      resetUI,
      setGlobalError,
      setContextualError,
      clearErrors,
      startOperation,
      endOperation,
      isOperationPending,
      markNoticeSeen,
      dismissNotice,
      isNoticeDismissed,
      clearNoticeCache,
      reset,
    ]
  );

  /**
   * Create context value
   */
  const contextValue: AppStateContextValue = useMemo(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}
