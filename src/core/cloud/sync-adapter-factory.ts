/**
 * Sync Adapter Factory
 *
 * Creates SyncAdapter instances based on current cloud provider config.
 */

import { FirebaseSyncAdapter } from "./firebase-adapter";
import { CloudConfigManager } from "./config";
import { FirebaseCloudProvider } from "./firebase";
import { attachSyncAdapterConsoleLogging } from "../sync/sync-adapter";
import type { SyncAdapter } from "../sync/sync-adapter";

export function createSyncAdapter(configManager: CloudConfigManager): SyncAdapter | null {
  if (!configManager.isCloudEnabled()) return null;

  const provider = configManager.getProvider();
  if (!provider) return null;

  // Extendable: add other providers (e.g., Supabase) here.
  if (provider instanceof FirebaseCloudProvider) {
    return new FirebaseSyncAdapter(provider);
  }

  return null;
}

/**
 * Same as createSyncAdapter, but attaches a console logger to all adapter events.
 * Returns both the adapter and a detach function to remove listeners.
 *
 * Example:
 *   const { adapter, detach } = createSyncAdapterWithLogging(config, "sync");
 *   if (adapter) {
 *     const engine = new SyncEngine(clientId, adapter);
 *     // later: detach();
 *   }
 */
export function createSyncAdapterWithLogging(
  configManager: CloudConfigManager,
  label: string = "sync"
): { adapter: SyncAdapter; detach: () => void } | null {
  const adapter = createSyncAdapter(configManager);
  if (!adapter) return null;

  const detach = attachSyncAdapterConsoleLogging(adapter, label);
  return { adapter, detach };
}
