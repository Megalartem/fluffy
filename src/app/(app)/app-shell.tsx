"use client";

import { usePathname } from "next/navigation";
import { WorkspaceProvider } from "@/shared/config/WorkspaceProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFab = pathname?.startsWith("/settings");

  // const { syncState, conflicts, resolveConflicts } = useSyncStatus();

  // const getSyncStatus = () => {
  //   if (syncState.conflicts > 0) return "conflict";
  //   if (!syncState.isOnline) return "idle";
  //   if (syncState.isSyncing) return "syncing";
  //   if (syncState.failedChanges > 0) return "error";
  //   if (syncState.lastSyncTime) return "synced";
  //   return "idle";
  // };

  return (
    // <WorkspaceProvider>
        {children}
    // </WorkspaceProvider>
  );
}
