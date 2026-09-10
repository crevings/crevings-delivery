/**
 * Client-side storage cleanup.
 *
 * Auth is fully HttpOnly-cookie based (the backend never returns tokens in the
 * response body), so nothing sensitive is written to localStorage/sessionStorage
 * anymore. This helper only removes legacy keys written by older app versions
 * so an upgrade doesn't leave stale tokens, drafts or partner data behind.
 */
const LEGACY_SESSION_KEYS = [
  'delivery_auth_token',
  'delivery_refresh_token',
  'delivery_session',
  'delivery_partner_data',
  'delivery_fcm_token',
];

export function clearSecureStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    LEGACY_SESSION_KEYS.forEach((k) => {
      try { sessionStorage.removeItem(k); } catch { /* non-fatal */ }
    });
    // Clean up any stale partner-scoped or draft items from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('onboarding_') ||
         key.startsWith('delivery_') ||
         key.includes('partner') ||
         key.includes('profile'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => {
      try { localStorage.removeItem(k); } catch { /* non-fatal */ }
    });
  } catch (e) {
    console.error('Failed to clear secure storage:', e);
  }
}