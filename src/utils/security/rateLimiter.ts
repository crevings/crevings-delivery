type RateLimitRecord = { count: number; lastReset: number };

const stores = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  key?: string;
}

export function checkRateLimit(options: RateLimitOptions): boolean {
  const key = options.key || 'global';
  const now = Date.now();
  const record = stores.get(key);

  if (!record || now - record.lastReset > options.windowMs) {
    stores.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= options.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitRemaining(options: RateLimitOptions): number {
  const key = options.key || 'global';
  const now = Date.now();
  const record = stores.get(key);

  if (!record || now - record.lastReset > options.windowMs) {
    return options.maxRequests;
  }

  return Math.max(0, options.maxRequests - record.count);
}

export function resetRateLimit(key?: string): void {
  const target = key || 'global';
  stores.delete(target);
}

export function getRateLimitResetTime(options: RateLimitOptions): number {
  const key = options.key || 'global';
  const record = stores.get(key);
  if (!record) return 0;
  return record.lastReset + options.windowMs;
}
