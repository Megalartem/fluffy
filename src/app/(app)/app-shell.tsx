"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { QuickAddFAB } from "@/shared/ui/quick-add-fab";
import { TransactionSheet } from "@/features/transactions/ui/transaction-sheet";
import { ClientOnly } from "@/shared/ui/client-only";
import { WorkspaceProvider } from "@/shared/config/workspace-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hideFab = pathname?.startsWith("/settings");

  return (
    <WorkspaceProvider>
      <>
        {children}

        <ClientOnly>
          {!hideFab && <QuickAddFAB onClick={() => setOpen(true)} />}
          <TransactionSheet open={open} onClose={() => setOpen(false)} mode="create" onChanged={function (): void {
                      throw new Error("Function not implemented.");
                  } } />
        </ClientOnly>
      </>
    </WorkspaceProvider>
  );
}
