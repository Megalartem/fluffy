"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";

export type SyncStatus = "idle" | "syncing" | "conflict" | "error" | "synced";

export interface SyncStatusBadgeProps {
  status: SyncStatus;
  progress?: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

const statusConfig = {
  idle: {
    icon: CheckCircle2,
    label: "Ready",
    className: "bg-muted text-muted-foreground",
    animate: false,
  },
  syncing: {
    icon: RefreshCw,
    label: "Syncing",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    animate: true,
  },
  synced: {
    icon: CheckCircle2,
    label: "Synced",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
    animate: false,
  },
  conflict: {
    icon: AlertCircle,
    label: "Conflict",
    className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    animate: false,
  },
  error: {
    icon: XCircle,
    label: "Error",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
    animate: false,
  },
};

export function SyncStatusBadge({
  status,
  progress,
  className,
  showLabel = true,
}: SyncStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          config.animate && "animate-spin"
        )}
      />
      {showLabel && <span>{config.label}</span>}
      {status === "syncing" && typeof progress === "number" && (
        <span className="text-xs opacity-75">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
