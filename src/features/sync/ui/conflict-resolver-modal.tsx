"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Conflict } from "@/core/sync/types";
import type { ConflictStrategy } from "@/core/sync/conflict-resolver";

export interface ConflictResolverModalProps {
  conflicts: Conflict[];
  onResolve: (strategy: ConflictStrategy) => void;
  onCancel: () => void;
  className?: string;
}

export function ConflictResolverModal({
  conflicts,
  onResolve,
  onCancel,
  className,
}: ConflictResolverModalProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictStrategy>("last-write-wins");

  const strategies: { value: ConflictStrategy; label: string; description: string }[] = [
    {
      value: "local",
      label: "Keep Local",
      description: "Use your local changes and discard remote changes",
    },
    {
      value: "remote",
      label: "Keep Remote",
      description: "Use remote changes and discard your local changes",
    },
    {
      value: "merge",
      label: "Merge Changes",
      description: "Combine both local and remote changes intelligently",
    },
    {
      value: "last-write-wins",
      label: "Last Write Wins",
      description: "Use the most recently updated version",
    },
  ];

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50", className)}>
      <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-yellow-500/10 p-2">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sync Conflicts Detected</h2>
            <p className="text-sm text-muted-foreground">
              {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} need{conflicts.length === 1 ? "s" : ""} resolution
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          {conflicts.slice(0, 3).map((conflict, idx) => (
            <div key={conflict.id} className="rounded-lg border bg-muted/50 p-3">
              <div className="mb-2 text-sm font-medium">
                Conflict #{idx + 1}: {conflict.entityType} - {conflict.field}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-background px-2 py-1">
                  Local: {JSON.stringify(conflict.localValue)}
                </span>
                <ArrowRight className="h-3 w-3" />
                <span className="rounded bg-background px-2 py-1">
                  Remote: {JSON.stringify(conflict.remoteValue)}
                </span>
              </div>
            </div>
          ))}
          {conflicts.length > 3 && (
            <p className="text-xs text-muted-foreground">
              ... and {conflicts.length - 3} more conflict{conflicts.length - 3 !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium">Resolution Strategy</label>
          <div className="space-y-2">
            {strategies.map((strategy) => (
              <button
                key={strategy.value}
                onClick={() => setSelectedStrategy(strategy.value)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  selectedStrategy === strategy.value
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <div className="font-medium">{strategy.label}</div>
                <div className="text-xs text-muted-foreground">{strategy.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border bg-background px-4 py-2 font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={() => onResolve(selectedStrategy)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Resolve Conflicts
          </button>
        </div>
      </div>
    </div>
  );
}
