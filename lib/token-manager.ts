/**
 * Token Management Utility
 * Handles JWT token storage, retrieval, and refresh
 */

const TOKEN_KEY = 'propman:auth_token';
const USER_KEY = 'propman:user';
const REFRESH_TOKEN_KEY = 'propman:refresh_token';

/**
 * Store authentication token and user data
 */
export function setAuthToken(token: string, user: any) {
  if (typeof window === 'undefined') return; // SSR check

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null; // SSR check

  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user data
 */
export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null; // SSR check

  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Clear all auth data
 */
export function clearAuthData() {
  if (typeof window === 'undefined') return; // SSR check

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Check if token is expired (basic check based on JWT)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // exp is in seconds, convert to ms
    return Date.now() >= expiryTime;
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
}

/**
 * Get token expiry time
 */
export function getTokenExpiryTime(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * Get user role from token
 */
export function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch (error) {
    return null;
  }
}

/**
 * Setup automatic token refresh before expiry
 * Returns cleanup function
 */
export function setupTokenRefreshTimer(expiryTime: Date, onRefresh: () => void): () => void {
  // Refresh 5 minutes before actual expiry
  const refreshTime = expiryTime.getTime() - 5 * 60 * 1000;
  const now = Date.now();
  const timeUntilRefresh = Math.max(0, refreshTime - now);

  const timerId = setTimeout(() => {
    onRefresh();
  }, timeUntilRefresh);

  // Return cleanup function
  return () => clearTimeout(timerId);
}

/**
 * Update user data
 */
export function updateStoredUser(user: any) {
  if (typeof window === 'undefined') return; // SSR check

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Validate token structure
 */
export function isValidToken(token: string): boolean {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if payload can be parsed
    JSON.parse(atob(parts[1]));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get token from Authorization header value
 */
export function extractTokenFromHeader(headerValue: string): string | null {
  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    return null;
  }
  return headerValue.substring(7);
}

/**
 * Create Authorization header value
 */
export function createAuthorizationHeader(token: string): string {
  return `Bearer ${token}`;
}
