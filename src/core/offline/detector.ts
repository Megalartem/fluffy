/**
 * Offline Detector
 *
 * Detects and manages online/offline status
 */

export interface NetworkStatus {
  isOnline: boolean;
  type: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  downlink?: number; // Mbps
  rtt?: number; // milliseconds
  saveData?: boolean;
}

export class OfflineDetector {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private lastStatusChange: number = Date.now();

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen to browser online/offline events
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());

    // Check network information if available
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener("change", () => this.notifyListeners());
    }

    // Periodic connectivity check
    this.startPeriodicCheck();
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.lastStatusChange = Date.now();
    this.notifyListeners();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.lastStatusChange = Date.now();
    this.notifyListeners();
  }

  /**
   * Start periodic connectivity check
   */
  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, 30 * 1000); // Check every 30 seconds
  }

  /**
   * Check actual connectivity with HTTP HEAD request
   */
  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });

      const wasOnline = this.isOnline;
      this.isOnline = response.ok;

      if (wasOnline !== this.isOnline) {
        this.lastStatusChange = Date.now();
        this.notifyListeners();
      }
    } catch {
      if (this.isOnline) {
        this.isOnline = false;
        this.lastStatusChange = Date.now();
        this.notifyListeners();
      }
    }
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    const connection = (navigator as any).connection;

    return {
      isOnline: this.isOnline,
      type: connection?.effectiveType || "unknown",
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData || false,
    };
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Is connection slow?
   */
  isSlowConnection(): boolean {
    const status = this.getStatus();
    return (
      status.type === "2g" ||
      status.type === "slow-2g" ||
      (status.downlink !== undefined && status.downlink < 1)
    );
  }

  /**
   * Should save data?
   */
  shouldSaveData(): boolean {
    const status = this.getStatus();
    return status.saveData || this.isSlowConnection();
  }

  /**
   * Get time since last status change
   */
  getTimeSinceStatusChange(): number {
    return Date.now() - this.lastStatusChange;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners.clear();
    window.removeEventListener("online", () => this.handleOnline());
    window.removeEventListener("offline", () => this.handleOffline());
  }
}
