"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { QuickAddFAB } from "@/shared/ui/quick-add-fab";
import { TransactionSheet } from "@/features/transactions/ui/transaction-sheet";
import { ClientOnly } from "@/shared/ui/client-only";
import { WorkspaceProvider } from "@/shared/config/workspace-context";
import { SyncStatusBadge, ConflictResolverModal } from "@/features/sync/ui";
import { useSyncStatus } from "@/features/sync/hooks/use-sync-status";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const pathname = usePathname();
  const hideFab = pathname?.startsWith("/settings");

  const { syncState, conflicts, resolveConflicts } = useSyncStatus();

  const getSyncStatus = () => {
    if (syncState.conflicts > 0) return "conflict";
    if (!syncState.isOnline) return "idle";
    if (syncState.isSyncing) return "syncing";
    if (syncState.failedChanges > 0) return "error";
    if (syncState.lastSyncTime) return "synced";
    return "idle";
  };

  return (
    <WorkspaceProvider>
      <>
        {children}

        <ClientOnly>
          {/* Conflict Resolution Modal */}
          {showConflicts && conflicts.length > 0 && (
            <ConflictResolverModal
              conflicts={conflicts}
              onResolve={async (strategy) => {
                await resolveConflicts(strategy);
                setShowConflicts(false);
              }}
              onCancel={() => setShowConflicts(false)}
            />
          )}

          {/* FAB and Transaction Sheet */}
          {!hideFab && <QuickAddFAB onClick={() => setOpen(true)} />}
          <TransactionSheet 
            open={open} 
            onClose={() => setOpen(false)} 
            mode="create" 
            onChanged={function (): void {
              throw new Error("Function not implemented.");
            }} 
          />
        </ClientOnly>
      </>
    </WorkspaceProvider>
  );
}
