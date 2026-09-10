import { get } from '@/api/fetcher';

interface SSEClientOptions {
  /** The SSE endpoint URL */
  url: string;
  /** Map of event names to handlers. 'message' catches untyped events. */
  events?: Record<string, (data: any) => void>;
  /** Called on each successful connection or reconnect */
  onConnected?: () => void;
  /** Called when the connection state changes */
  onConnectionChange?: (connected: boolean) => void;
  /** Maximum reconnect attempts before giving up (default: 10) */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseDelay?: number;
  /** Maximum delay in ms (default: 10000) */
  maxDelay?: number;
}

interface SSEClient {
  connect: () => void;
  close: () => void;
  reconnect: () => void;
}

export function createSSEClient(options: SSEClientOptions): SSEClient {
  const {
    url,
    events = {},
    onConnected,
    onConnectionChange,
    maxRetries = 10,
    baseDelay = 1000,
    maxDelay = 10000,
  } = options;

  let eventSource: EventSource | null = null;
  let retryCount = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function getDelay(): number {
    return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  }

  function connect() {
    if (closed) return;
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(url, { withCredentials: true });

    // Register custom event listeners
    for (const [eventName, handler] of Object.entries(events)) {
      eventSource.addEventListener(eventName, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handler(data);
        } catch {
          handler(e.data);
        }
      });
    }

    // Handle reconnect event from server (30min max lifetime)
    eventSource.addEventListener('reconnect', () => {
      console.log('[SSE] Server requested reconnect');
      eventSource?.close();
      eventSource = null;
      retryCount = 0;
      onConnectionChange?.(false);
      setTimeout(connect, 1000);
    });

    // Handle connection opened
    eventSource.addEventListener('open', () => {
      retryCount = 0;
      onConnectionChange?.(true);
      onConnected?.();
    });

    // Handle errors — auto-reconnect with exponential backoff
    eventSource.onerror = () => {
      if (closed) return;

      eventSource?.close();
      eventSource = null;
      onConnectionChange?.(false);

      if (retryCount >= maxRetries) {
        console.error(`[SSE] Max retries (${maxRetries}) reached`);
        return;
      }

      const delay = getDelay();
      console.warn(`[SSE] Connection lost. Reconnecting in ${delay}ms (attempt ${retryCount + 1})`);
      retryCount++;

      reconnectTimer = setTimeout(connect, delay);
    };
  }

  function close() {
    closed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    onConnectionChange?.(false);
  }

  function reconnect() {
    retryCount = 0;
    close();
    closed = false;
    connect();
  }

  return { connect, close, reconnect };
}

export interface MercureRealtimeClientOptions {
  scope: 'delivery' | 'restaurant' | 'consumer';
  events?: Record<string, (data: any) => void>;
  onConnected?: () => void;
  onConnectionChange?: (connected: boolean) => void;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

/**
 * Mercure-exclusive real-time client for delivery partner app.
 *
 * Connects directly to the Mercure Hub via EventSource with zero Node.js socket load.
 * If Mercure is down or misconfigured, it logs/throws an error to console and
 * will NOT fall back to legacy Node.js SSE.
 */
export function createMercureRealtimeClient(options: MercureRealtimeClientOptions) {
  const {
    scope,
    events = {},
    onConnected,
    onConnectionChange,
    maxRetries = 10,
    baseDelay = 1000,
    maxDelay = 10000,
  } = options;

  let eventSource: EventSource | null = null;
  let retryCount = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function getDelay(): number {
    return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  }

  async function connect() {
    if (closed) return;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    try {
      // 1. Fetch Mercure token and discovery information
      const res = await get<any>(`/${scope}/realtime/token?scope=${scope}`);
      const data = res?.data || res;

      if (!data || data.mode !== 'mercure' || !data.hubUrl || !data.topics?.length) {
        console.error(
          `[Mercure Realtime Error] Mercure Hub is unavailable or disabled for '${scope}' (mode: ${data?.mode || 'none'}). ` +
          `Delivery real-time stream will NOT fall back to legacy Node SSE to prevent server socket overload.`
        );
        onConnectionChange?.(false);
        return;
      }

      // 2. Build Mercure EventSource URL
      const hubUrl = new URL(data.hubUrl);
      data.topics.forEach((topic: string) => {
        hubUrl.searchParams.append('topic', topic);
      });
      if (data.token) {
        hubUrl.searchParams.append('authorization', data.token);
      }

      eventSource = new EventSource(hubUrl.toString());

      // 3. Register custom event listeners (e.g. 'dispatch', 'floating_cash_update', 'connected')
      for (const [eventName, handler] of Object.entries(events)) {
        eventSource.addEventListener(eventName, (e: MessageEvent) => {
          try {
            const parsed = JSON.parse(e.data);
            handler(parsed);
          } catch {
            handler(e.data);
          }
        });
      }

      // Also listen to default message events if sent untyped
      eventSource.onmessage = (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed?.type && events[parsed.type]) {
            events[parsed.type](parsed);
          } else if (events['message']) {
            events['message'](parsed);
          }
        } catch {
          if (events['message']) events['message'](e.data);
        }
      };

      eventSource.onopen = () => {
        retryCount = 0;
        console.log(`[Mercure Realtime] Connected directly to Mercure Hub for ${scope}`);
        onConnectionChange?.(true);
        onConnected?.();
      };

      eventSource.onerror = (err) => {
        if (closed) return;
        eventSource?.close();
        eventSource = null;
        onConnectionChange?.(false);

        if (retryCount >= maxRetries) {
          console.error(`[Mercure Realtime Error] Max retries (${maxRetries}) reached. Mercure hub connection failed.`);
          return;
        }

        const delay = getDelay();
        console.error(`[Mercure Realtime Error] Connection lost to Mercure Hub. Retrying in ${delay}ms...`, err);
        retryCount++;
        reconnectTimer = setTimeout(connect, delay);
      };
    } catch (err: any) {
      console.error(
        `[Mercure Realtime Error] Failed to discover/connect to Mercure hub for ${scope}:`,
        err?.message || err
      );
      if (retryCount < maxRetries) {
        const delay = getDelay();
        retryCount++;
        reconnectTimer = setTimeout(connect, delay);
      }
    }
  }

  function close() {
    closed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    onConnectionChange?.(false);
  }

  return {
    connect,
    close,
  };
}
