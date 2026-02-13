"use client";

/**
 * Workspace Context
 * 
 * Предоставляет workspaceId всем компонентам приложения
 * через React Context, избавляя от необходимости вызывать
 * `new WorkspaceService().getCurrentWorkspaceId()` повсеместно
 */

import { createContext, useContext, ReactNode, useMemo } from "react";
import { DEFAULTS } from "@/shared/constants";

interface WorkspaceContextType {
  /**
   * ID текущего workspace
   * Сейчас всегда "ws_local", но в будущем может быть разным
   */
  workspaceId: string;
  currency: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Provider компонент для WorkspaceContext
 * 
 * Должен быть размещен как можно выше в дереве компонентов,
 * обычно в app-shell или в корневом layout
 */
export function WorkspaceProvider({
  children,
  workspaceId = DEFAULTS.LOCAL_WORKSPACE_ID,
  currency = DEFAULTS.CURRENCY,

}: {
  children: ReactNode;
  /** Опциональное переопределение workspaceId (для тестирования) */
  workspaceId?: string;
  /** Опциональное переопределение валюты (для тестирования) */
  currency?: string;
}) {
  const contextValue = useMemo(
    () => ({
      workspaceId,
      currency,
    }),
    [workspaceId, currency]
  );

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

/**
 * Хук для получения текущего workspaceId
 * 
 * @throws Error если используется вне WorkspaceProvider
 * @returns объект с workspaceId
 * 
 * @example
 * const { workspaceId } = useWorkspace();
 */
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace() must be used within <WorkspaceProvider>. " +
        "Make sure WorkspaceProvider wraps your component tree."
    );
  }

  return context;
}
