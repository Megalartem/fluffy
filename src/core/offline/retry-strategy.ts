/**
 * Retry Strategy
 *
 * Implements exponential backoff and retry logic
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 32000,
  backoffMultiplier: 2,
  jitter: true,
};

export class RetryStrategy {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Calculate delay for retry attempt
   */
  getDelay(retryCount: number): number {
    if (retryCount < 0) {
      retryCount = 0;
    }

    // Exponential backoff: initialDelay * (multiplier ^ retryCount)
    let delay = Math.min(
      this.config.initialDelayMs *
        Math.pow(this.config.backoffMultiplier, retryCount),
      this.config.maxDelayMs
    );

    // Add jitter (±10%)
    if (this.config.jitter) {
      const jitterPercent = 0.1;
      const jitterAmount = delay * jitterPercent;
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }

    return Math.max(0, Math.floor(delay));
  }

  /**
   * Retry operation with exponential backoff
   */
  async retry<T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, delay: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.config.maxRetries) {
          const delay = this.getDelay(attempt);
          onRetry?.(attempt + 1, delay, error as Error);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("Retry failed");
  }

  /**
   * Should retry based on error
   */
  isRetryable(error: Error | { code?: string; status?: number }): boolean {
    const errorObj = error as any;

    // Network errors are retryable
    if (errorObj instanceof TypeError && errorObj.message === "Failed to fetch") {
      return true;
    }

    // HTTP status codes that are retryable
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    if (retryableStatuses.includes(errorObj.status)) {
      return true;
    }

    // Specific error codes
    const retryableCodes = [
      "ECONNREFUSED",
      "ECONNRESET",
      "ETIMEDOUT",
      "EHOSTUNREACH",
      "ENETUNREACH",
    ];
    if (retryableCodes.includes(errorObj.code)) {
      return true;
    }

    return false;
  }

  /**
   * Wait for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get config
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  /**
   * Set config
   */
  setConfig(config: Partial<RetryConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}

/**
 * Utility function for quick retry
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const strategy = new RetryStrategy({ maxRetries });
  return strategy.retry(operation);
}
