/**
 * Storage Manager
 *
 * Manages IndexedDB storage quotas and cleanup
 */

export interface StorageStats {
  usage: number; // bytes
  quota: number; // bytes
  percentage: number; // 0-100
  available: number; // bytes
}

export class StorageManager {
  private readonly CLEANUP_THRESHOLD = 0.9; // 90% of quota
  private readonly TARGET_USAGE = 0.7; // Target 70% after cleanup

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;

      return {
        usage,
        quota,
        percentage: quota > 0 ? (usage / quota) * 100 : 0,
        available: Math.max(0, quota - usage),
      };
    }

    return {
      usage: 0,
      quota: 0,
      percentage: 0,
      available: 0,
    };
  }

  /**
   * Check if cleanup is needed
   */
  async needsCleanup(): Promise<boolean> {
    const stats = await this.getStats();
    return stats.percentage >= this.CLEANUP_THRESHOLD * 100;
  }

  /**
   * Request persistent storage
   */
  async requestPersistent(): Promise<boolean> {
    if ("storage" in navigator && "persist" in navigator.storage) {
      try {
        return await navigator.storage.persist();
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Check if storage is persistent
   */
  async isPersistent(): Promise<boolean> {
    if ("storage" in navigator && "persisted" in navigator.storage) {
      return await navigator.storage.persisted();
    }
    return false;
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) +
      " " +
      sizes[i];
  }

  /**
   * Get human-readable storage info
   */
  async getReadableStats(): Promise<{
    used: string;
    quota: string;
    available: string;
    percentage: string;
  }> {
    const stats = await this.getStats();

    return {
      used: this.formatBytes(stats.usage),
      quota: this.formatBytes(stats.quota),
      available: this.formatBytes(stats.available),
      percentage: stats.percentage.toFixed(1) + "%",
    };
  }
}
