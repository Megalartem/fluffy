import { META_KEYS } from "@/shared/constants/meta-keys";
import { MetaService } from "@/shared/lib/storage/meta";

/**
 * MetaRegistry - centralized metadata management
 * Handles all meta.db operations with type safety and caching
 *
 * Key responsibilities:
 * - Last transaction defaults (type, categoryId, currency)
 * - Budget notification states
 * - Goal notification states
 * - Seeded categories status
 * - Schema version tracking
 */

export interface MetaRegistryConfig {
  cacheEnabled?: boolean;
  ttlMs?: number;
}

export class MetaRegistry {
  private metaService: MetaService;
  private cache = new Map<string, { value: string | null; timestamp: number }>();
  private cacheEnabled: boolean;
  private ttlMs: number;

  constructor(config: MetaRegistryConfig = {}) {
    this.metaService = new MetaService();
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.ttlMs = config.ttlMs ?? 1000 * 60 * 5; // 5 minutes default
  }

  /**
   * Get cached value with TTL check
   */
  private getCached(key: string): string | null | undefined {
    if (!this.cacheEnabled) return undefined;

    const cached = this.cache.get(key);
    if (!cached) return undefined;

    const isExpired = Date.now() - cached.timestamp > this.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  /**
   * Set cache entry
   */
  private setCached(key: string, value: string | null): void {
    if (!this.cacheEnabled) return;
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * Last transaction defaults: { type, categoryId, currency }
   */
  async getLastTransactionDefaults(): Promise<{
    type: "expense" | "income";
    categoryId: string | null;
    currency: string;
  } | null> {
    const key = META_KEYS.LAST_TRANSACTION_DEFAULTS;
    const cached = this.getCached(key);
    if (cached !== undefined) {
      return cached ? JSON.parse(cached) : null;
    }

    const raw = await this.metaService.get(key);
    this.setCached(key, raw);

    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async setLastTransactionDefaults(defaults: {
    type: "expense" | "income";
    categoryId: string | null;
    currency: string;
  }): Promise<void> {
    const key = META_KEYS.LAST_TRANSACTION_DEFAULTS;
    await this.metaService.set(key, JSON.stringify(defaults));
    this.setCached(key, JSON.stringify(defaults));
  }

  /**
   * Seeded categories status per workspace
   */
  async isSeeded(workspaceId: string): Promise<boolean> {
    const key = META_KEYS.SEED_CATEGORIES(workspaceId);
    const cached = this.getCached(key);
    if (cached !== undefined) {
      return cached === "true";
    }

    const raw = await this.metaService.get(key);
    this.setCached(key, raw);
    return raw === "true";
  }

  async markSeeded(workspaceId: string): Promise<void> {
    const key = META_KEYS.SEED_CATEGORIES(workspaceId);
    await this.metaService.set(key, "true");
    this.setCached(key, "true");
  }

  /**
   * Budget notification state
   */
  async isBudgetNotified(workspaceId: string, categoryId: string): Promise<boolean> {
    const key = META_KEYS.BUDGET_NOTIFIED(workspaceId, categoryId);
    const cached = this.getCached(key);
    if (cached !== undefined) {
      return cached === "true";
    }

    const raw = await this.metaService.get(key);
    this.setCached(key, raw);
    return raw === "true";
  }

  async markBudgetNotified(workspaceId: string, categoryId: string): Promise<void> {
    const key = META_KEYS.BUDGET_NOTIFIED(workspaceId, categoryId);
    await this.metaService.set(key, "true");
    this.setCached(key, "true");
  }

  async resetBudgetNotified(workspaceId: string, categoryId: string): Promise<void> {
    const key = META_KEYS.BUDGET_NOTIFIED(workspaceId, categoryId);
    await this.metaService.set(key, "false");
    this.setCached(key, "false");
  }

  /**
   * Goal notification state
   */
  async isGoalNotified(workspaceId: string, goalId: string): Promise<boolean> {
    const key = META_KEYS.GOAL_NOTIFIED(workspaceId, goalId);
    const cached = this.getCached(key);
    if (cached !== undefined) {
      return cached === "true";
    }

    const raw = await this.metaService.get(key);
    this.setCached(key, raw);
    return raw === "true";
  }

  async markGoalNotified(workspaceId: string, goalId: string): Promise<void> {
    const key = META_KEYS.GOAL_NOTIFIED(workspaceId, goalId);
    await this.metaService.set(key, "true");
    this.setCached(key, "true");
  }

  async resetGoalNotified(workspaceId: string, goalId: string): Promise<void> {
    const key = META_KEYS.GOAL_NOTIFIED(workspaceId, goalId);
    await this.metaService.set(key, "false");
    this.setCached(key, "false");
  }

  /**
   * Schema version tracking
   */
  async getSchemaVersion(): Promise<string | null> {
    const key = META_KEYS.SCHEMA_VERSION;
    const cached = this.getCached(key);
    if (cached !== undefined) {
      return cached;
    }

    const raw = await this.metaService.get(key);
    this.setCached(key, raw);
    return raw;
  }

  async setSchemaVersion(version: string): Promise<void> {
    const key = META_KEYS.SCHEMA_VERSION;
    await this.metaService.set(key, version);
    this.setCached(key, version);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific workspace
   */
  clearCacheForWorkspace(workspaceId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(workspaceId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}
