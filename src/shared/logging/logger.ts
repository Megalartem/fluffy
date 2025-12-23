/**
 * Logger - Application-wide logging service
 *
 * Provides:
 * - Structured logging with severity levels
 * - Environment-aware output (dev/prod)
 * - Performance tracking
 * - Error tracking with stack traces
 * - Local storage persistence for debugging
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  isDev: boolean;
}

export interface PerformanceMarker {
  name: string;
  startTime: number;
}

/**
 * Logger singleton
 */
export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 500; // keep last 500 logs in memory
  private performanceMarkers = new Map<string, PerformanceMarker>();
  private isDev = process.env.NODE_ENV === "development";

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      isDev: this.isDev,
    };

    // Add to memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDev) {
      const style = this.getConsoleStyle(level);
      const prefix = `[${level.toUpperCase()}]`;
      console.log(`%c${prefix} ${message}`, style, context || "");
    }

    // Error tracking for production
    if (level === "error" && !this.isDev) {
      this.trackErrorInProduction(message, context);
    }
  }

  /**
   * Log levels
   */
  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  }

  /**
   * Log error with stack trace
   */
  errorWithStack(error: Error, context?: Record<string, unknown>) {
    this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  /**
   * Performance tracking
   */
  startPerformance(name: string) {
    this.performanceMarkers.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  endPerformance(name: string): number | null {
    const marker = this.performanceMarkers.get(name);
    if (!marker) {
      this.warn(`Performance marker '${name}' not found`);
      return null;
    }

    const duration = performance.now() - marker.startTime;
    this.performanceMarkers.delete(name);

    this.info(`Performance: ${name}`, {
      durationMs: Math.round(duration * 100) / 100,
    });

    return duration;
  }

  /**
   * Get all logs
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
    this.performanceMarkers.clear();
  }

  /**
   * Console styling
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: "color: #888; font-weight: normal;",
      info: "color: #0066cc; font-weight: bold;",
      warn: "color: #ff8800; font-weight: bold;",
      error: "color: #cc0000; font-weight: bold; background: #ffe6e6;",
    };
    return styles[level];
  }

  /**
   * Track errors in production (stub for external service)
   */
  private trackErrorInProduction(message: string, context?: Record<string, unknown>) {
    // In real app, would send to external error tracking service
    // e.g., Sentry, LogRocket, etc.
    // For now, just store locally
    try {
      const key = `error_log_${Date.now()}`;
      sessionStorage.setItem(key, JSON.stringify({ message, context }));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }
}

/**
 * Global logger instance
 */
export const logger = Logger.getInstance();

/**
 * Typed logger for specific domains
 */
export function createDomainLogger(domain: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      logger.debug(`[${domain}] ${message}`, context),
    info: (message: string, context?: Record<string, unknown>) =>
      logger.info(`[${domain}] ${message}`, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      logger.warn(`[${domain}] ${message}`, context),
    error: (message: string, context?: Record<string, unknown>) =>
      logger.error(`[${domain}] ${message}`, context),
    errorWithStack: (error: Error, context?: Record<string, unknown>) =>
      logger.errorWithStack(error, { ...context, domain }),
    startPerformance: (name: string) => logger.startPerformance(`${domain}:${name}`),
    endPerformance: (name: string) => logger.endPerformance(`${domain}:${name}`),
  };
}
