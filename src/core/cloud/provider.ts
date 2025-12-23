/**
 * Cloud Provider Interface
 *
 * Abstract interface for cloud storage providers
 */

import type { User } from "./auth";

export interface ICloudAuth {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  register(email: string, password: string): Promise<User>;
  getCurrentUser(): User | null;
  refreshToken(): Promise<string>;
}

export interface ICloudStorage {
  upload(path: string, data: Blob): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listFiles(prefix: string): Promise<string[]>;
  getDownloadUrl(path: string, expiresIn?: number): Promise<string>;
}

export interface ICloudProvider {
  readonly name: string;
  readonly auth: ICloudAuth;
  readonly storage: ICloudStorage;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  reconnect(): Promise<void>;
  getStatus(): Promise<CloudProviderStatus>;
}

export interface CloudProviderStatus {
  connected: boolean;
  authenticated: boolean;
  lastSync?: number;
  storageUsed?: number;
  storageQuota?: number;
}

export interface CloudProviderConfig {
  apiKey?: string;
  projectId?: string;
  databaseUrl?: string;
  storageBucket?: string;
  authDomain?: string;
  appId?: string;
  [key: string]: any;
}
