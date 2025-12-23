/**
 * Cloud Authentication Types & Base
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  createdAt: number;
  lastSignIn: number;
  emailVerified: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: "Bearer";
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}
