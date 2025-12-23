/**
 * Cloud Module Index
 *
 * Export cloud provider interfaces and implementations
 */

export { FirebaseCloudProvider } from "./firebase";
export { FirebaseSyncAdapter } from "./firebase-adapter";
export { createSyncAdapter, createSyncAdapterWithLogging } from "./sync-adapter-factory";
export { CloudConfigManager, CloudProviderType, type CloudConfig } from "./config";
export type {
  ICloudProvider,
  ICloudAuth,
  ICloudStorage,
  CloudProviderStatus,
  CloudProviderConfig,
} from "./provider";
export type { User, AuthToken, AuthError, AuthState } from "./auth";
