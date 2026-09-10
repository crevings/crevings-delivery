import { get, BASE_URL } from '@/api/fetcher';

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
 * Mercure-first realtime client with seamless fallback to legacy Node SSE.
 *
 * 1. Queries `/${scope}/realtime/token?scope=${scope}`
 * 2. If mode === "mercure", connects directly to Mercure Hub (zero Node socket load).
 * 3. If mode === "sse" or Mercure is unreachable, falls back gracefully to
 *    legacy `${BASE_URL}/delivery/stream`.
 */
export function createMercureRealtimeClient(options: MercureRealtimeClientOptions): SSEClient {
  const {
    scope,
    events = {},
    onConnected,
    onConnectionChange,
    maxRetries = 10,
    baseDelay = 1000,
    maxDelay = 10000,
  } = options;

  let activeClient: SSEClient | null = null;
  let closed = false;

  async function start() {
    if (closed) return;

    try {
      // 1. Fetch Mercure token and discovery information
      const res = await get<any>(`/${scope}/realtime/token?scope=${scope}`);
      const data = res?.data || res;

      if (!closed && data?.mode === 'mercure' && data.hubUrl && data.topics?.length) {
        const hubUrl = new URL(data.hubUrl);
        data.topics.forEach((topic: string) => {
          hubUrl.searchParams.append('topic', topic);
        });
        if (data.token) {
          hubUrl.searchParams.append('authorization', data.token);
        }

        activeClient = createSSEClient({
          url: hubUrl.toString(),
          events,
          onConnected,
          onConnectionChange,
          maxRetries,
          baseDelay,
          maxDelay,
        });
        activeClient.connect();
        return;
      }
    } catch (err: any) {
      console.warn(`[Mercure Delivery] Discovery failed for ${scope}, falling back to legacy SSE:`, err?.message || err);
    }

    // Fallback to legacy Node.js SSE endpoint
    if (!closed) {
      const fallbackUrl = `${BASE_URL}/delivery/stream`;
      console.log(`[Delivery SSE Fallback] Connecting to legacy SSE stream at ${fallbackUrl}`);
      activeClient = createSSEClient({
        url: fallbackUrl,
        events,
        onConnected,
        onConnectionChange,
        maxRetries,
        baseDelay,
        maxDelay,
      });
      activeClient.connect();
    }
  }

  return {
    connect: () => {
      closed = false;
      start();
    },
    close: () => {
      closed = true;
      activeClient?.close();
      activeClient = null;
    },
    reconnect: () => {
      activeClient?.reconnect();
    },
  };
}
