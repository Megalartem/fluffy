/**
 * AppState - Global application state context
 * 
 * Manages:
 * - Current workspace context
 * - Workspace-specific metadata
 * - Notification dismissals
 * - UI state (modals, sheets, etc.)
 * - Error states
 * - Loading states
 */

import { createContext, useContext } from "react";
import type { Goal } from "@/features/goals/model/types";

/**
 * Core application state
 */
export interface AppState {
  // Workspace context
  workspaceId: string;

  // Dashboard state
  dashboard: {
    period: "current" | "previous";
    summary: {
      month: string;
      expenseTotal: number;
      incomeTotal: number;
    } | null;
    goals: Goal[];
    loading: boolean;
    error: string | null;
  };

  // Global UI state
  ui: {
    sidebarOpen: boolean;
    modalsOpen: Set<string>; // track multiple modals by ID
    sheetsOpen: Set<string>; // track multiple sheets by ID
  };

  // Error handling
  errors: {
    global: string | null;
    contextual: Map<string, string>; // error per feature/component
  };

  // Loading states
  loading: {
    initial: boolean;
    operations: Set<string>; // track async operations by ID
  };

  // Cached data
  cache: {
    lastSeenNoticeIds: Set<string>;
    dismissedNoticeIds: Set<string>;
  };
}

/**
 * AppState actions
 */
export interface AppStateActions {
  // Dashboard actions
  setDashboardPeriod(period: "current" | "previous"): void;
  setDashboardLoading(loading: boolean): void;
  setDashboardError(error: string | null): void;
  updateDashboardData(data: Partial<AppState["dashboard"]>): void;

  // UI actions
  toggleSidebar(): void;
  openModal(id: string): void;
  closeModal(id: string): void;
  openSheet(id: string): void;
  closeSheet(id: string): void;
  resetUI(): void;

  // Error actions
  setGlobalError(error: string | null): void;
  setContextualError(context: string, error: string | null): void;
  clearErrors(): void;

  // Loading actions
  startOperation(id: string): void;
  endOperation(id: string): void;
  isOperationPending(id: string): boolean;

  // Cache actions
  markNoticeSeen(noticeId: string): void;
  dismissNotice(noticeId: string): void;
  isNoticeDismissed(noticeId: string): boolean;
  clearNoticeCache(): void;

  // Full reset
  reset(): void;
}

/**
 * Default app state
 */
export const createDefaultAppState = (workspaceId: string): AppState => ({
  workspaceId,
  dashboard: {
    period: "current",
    summary: null,
    goals: [],
    loading: true,
    error: null,
  },
  ui: {
    sidebarOpen: true,
    modalsOpen: new Set(),
    sheetsOpen: new Set(),
  },
  errors: {
    global: null,
    contextual: new Map(),
  },
  loading: {
    initial: true,
    operations: new Set(),
  },
  cache: {
    lastSeenNoticeIds: new Set(),
    dismissedNoticeIds: new Set(),
  },
});

/**
 * AppStateContext type
 */
export interface AppStateContextValue {
  state: AppState;
  actions: AppStateActions;
}

/**
 * Create context
 */
export const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

/**
 * Hook to use app state
 * Throws error if used outside provider
 */
export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}

/**
 * Hook to get only state (read-only)
 */
export function useAppStateValue(): AppState {
  return useAppState().state;
}

/**
 * Hook to get only actions
 */
export function useAppStateActions(): AppStateActions {
  return useAppState().actions;
}
