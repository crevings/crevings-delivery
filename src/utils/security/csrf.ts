export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getCsrfTokenFromCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export function validateCsrfToken(token: string | null): boolean {
  if (!token || token.length !== 64) return false;
  return /^[a-f0-9]{64}$/i.test(token);
}
