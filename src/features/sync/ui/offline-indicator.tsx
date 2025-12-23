"use client";

import { cn } from "@/lib/utils";
import { WifiOff, Wifi } from "lucide-react";

export interface OfflineIndicatorProps {
  isOnline: boolean;
  queuedOperations?: number;
  className?: string;
}

export function OfflineIndicator({
  isOnline,
  queuedOperations = 0,
  className,
}: OfflineIndicatorProps) {
  if (isOnline && queuedOperations === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
        isOnline
          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
          : "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
        className
      )}
    >
      {isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span>
        {isOnline
          ? `${queuedOperations} pending sync${queuedOperations !== 1 ? "s" : ""}`
          : "Offline mode"}
      </span>
      {!isOnline && queuedOperations > 0 && (
        <span className="ml-1 rounded-full bg-orange-200 px-2 py-0.5 text-xs dark:bg-orange-800">
          {queuedOperations}
        </span>
      )}
    </div>
  );
}
