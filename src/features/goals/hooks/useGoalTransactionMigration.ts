"use client";

import * as React from "react";
import { useWorkspace } from "@/shared/config/WorkspaceProvider";
import {
  migrateGoalTransactions,
  checkMigrationNeeded,
} from "@/features/goals/model/migrate-goal-transactions";

/**
 * Hook to automatically migrate goal transactions on app load
 * 
 * This ensures that old goal contribution transactions get their linkedGoalId set.
 * Runs once per workspace session.
 */
export function useGoalTransactionMigration() {
  const { workspaceId } = useWorkspace();
  const [status, setStatus] = React.useState<
    "idle" | "checking" | "migrating" | "completed" | "error"
  >("idle");
  const [migratedCount, setMigratedCount] = React.useState(0);
  const hasRunRef = React.useRef(false);

  React.useEffect(() => {
    if (!workspaceId || hasRunRef.current) return;

    const runMigration = async () => {
      try {
        setStatus("checking");

        // Check if migration is needed
        const { needed, unmigrated } = await checkMigrationNeeded(workspaceId);

        if (!needed) {
          console.log("✅ No goal transaction migration needed");
          setStatus("completed");
          hasRunRef.current = true;
          return;
        }

        console.log(`⚠️ Found ${unmigrated} transactions that need migration`);
        setStatus("migrating");

        // Run migration
        const result = await migrateGoalTransactions(workspaceId);

        if (result.success) {
          console.log(`✨ Successfully migrated ${result.migratedCount} transactions`);
          setMigratedCount(result.migratedCount);
          setStatus("completed");
        } else {
          console.error("Migration completed with errors:", result.errors);
          setStatus("error");
        }

        hasRunRef.current = true;
      } catch (error) {
        console.error("Migration failed:", error);
        setStatus("error");
      }
    };

    // Run migration immediately when workspace is ready
    // Using requestIdleCallback for non-blocking execution
    if (typeof requestIdleCallback !== "undefined") {
      const handle = requestIdleCallback(() => {
        void runMigration();
      }, { timeout: 2000 });
      
      return () => cancelIdleCallback(handle);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timer = setTimeout(runMigration, 500);
      return () => clearTimeout(timer);
    }
  }, [workspaceId]);

  return {
    status,
    migratedCount,
    isComplete: status === "completed",
  };
}
