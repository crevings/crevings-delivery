const TOKEN_KEY = 'delivery_auth_token';
const REFRESH_KEY = 'delivery_refresh_token';
const SESSION_KEY = 'delivery_session';

export function setSecureToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to store token securely:', e);
  }
}

export function getSecureToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to retrieve token securely:', e);
    return null;
  }
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(REFRESH_KEY, token);
  } catch (e) {
    console.error('Failed to store refresh token:', e);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(REFRESH_KEY);
  } catch (e) {
    console.error('Failed to retrieve refresh token:', e);
    return null;
  }
}

export function clearSecureStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear secure storage:', e);
  }
}

export function isAuthenticated(): boolean {
  return getSecureToken() !== null;
}
