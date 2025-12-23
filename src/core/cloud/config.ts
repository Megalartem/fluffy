/**
 * Cloud Configuration
 *
 * Manages cloud provider configuration and initialization
 */

import type { CloudProviderConfig } from "./provider";
import { FirebaseCloudProvider } from "./firebase";

export enum CloudProviderType {
  Firebase = "firebase",
  Supabase = "supabase",
  None = "none",
}

export interface CloudConfig {
  provider: CloudProviderType;
  config: CloudProviderConfig;
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // milliseconds
}

const DEFAULT_CONFIG: CloudConfig = {
  provider: CloudProviderType.None,
  config: {},
  enabled: false,
  autoSync: false,
  syncInterval: 5 * 60 * 1000, // 5 minutes
};

export class CloudConfigManager {
  private config: CloudConfig;

  constructor(customConfig?: Partial<CloudConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...customConfig,
    };
  }

  getConfig(): CloudConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<CloudConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  getProvider() {
    switch (this.config.provider) {
      case CloudProviderType.Firebase:
        return new FirebaseCloudProvider(this.config.config);

      case CloudProviderType.Supabase:
        // TODO: Implement Supabase provider
        throw new Error("Supabase not yet implemented");

      case CloudProviderType.None:
      default:
        return null;
    }
  }

  isCloudEnabled(): boolean {
    return this.config.enabled && this.config.provider !== CloudProviderType.None;
  }

  getSyncInterval(): number {
    return this.config.syncInterval;
  }

  isAutoSyncEnabled(): boolean {
    return this.config.autoSync && this.isCloudEnabled();
  }

  /**
   * Load config from environment
   */
  static fromEnvironment(): CloudConfig {
    const provider = (process.env.NEXT_PUBLIC_CLOUD_PROVIDER ||
      "none") as CloudProviderType;

    if (provider === CloudProviderType.Firebase) {
      return {
        provider,
        config: {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        },
        enabled: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        autoSync: process.env.NEXT_PUBLIC_CLOUD_AUTO_SYNC === "true",
        syncInterval:
          parseInt(process.env.NEXT_PUBLIC_CLOUD_SYNC_INTERVAL || "300000") ||
          300000,
      };
    }

    return DEFAULT_CONFIG;
  }

  /**
   * Save config to localStorage
   */
  saveToStorage(key: string = "cloud-config"): void {
    localStorage.setItem(key, JSON.stringify(this.config));
  }

  /**
   * Load config from localStorage
   */
  static loadFromStorage(key: string = "cloud-config"): CloudConfig {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_CONFIG;
  }
}
