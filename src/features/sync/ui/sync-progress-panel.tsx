"use client";

import { cn } from "@/lib/utils";
import { SyncStatusBadge, type SyncStatus } from "./sync-status-badge";
import { OfflineIndicator } from "./offline-indicator";
import { Clock } from "lucide-react";

export interface SyncProgressPanelProps {
  status: SyncStatus;
  progress?: number;
  isOnline: boolean;
  queuedOperations?: number;
  lastSyncTime?: number;
  className?: string;
}

export function SyncProgressPanel({
  status,
  progress,
  isOnline,
  queuedOperations = 0,
  lastSyncTime,
  className,
}: SyncProgressPanelProps) {
  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Never";

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 10) return `${seconds}s ago`;
    return "Just now";
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Sync Status</h3>
        <SyncStatusBadge status={status} progress={progress} />
      </div>

      <OfflineIndicator isOnline={isOnline} queuedOperations={queuedOperations} />

      {lastSyncTime && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last synced {formatLastSync(lastSyncTime)}</span>
        </div>
      )}

      {status === "syncing" && typeof progress === "number" && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
