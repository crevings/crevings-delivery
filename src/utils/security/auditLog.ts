type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const MAX_LOG_ENTRIES = 1000;
let logs: LogEntry[] = [];

function shouldLog(): boolean {
  return typeof window !== 'undefined';
}

function addLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog()) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  logs.push(entry);

  if (logs.length > MAX_LOG_ENTRIES) {
    logs = logs.slice(-MAX_LOG_ENTRIES);
  }

  if (level === 'error' || level === 'security') {
    console.error(`[${level.toUpperCase()}] ${message}`, context || '');
  } else if (level === 'warn') {
    console.warn(`[${level.toUpperCase()}] ${message}`, context || '');
  }
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  addLog('info', message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  addLog('warn', message, context);
}

export function logError(message: string, context?: Record<string, unknown>): void {
  addLog('error', message, context);
}

export function logSecurity(message: string, context?: Record<string, unknown>): void {
  addLog('security', message, context);
}

export function getLogs(level?: LogLevel): LogEntry[] {
  if (!level) return [...logs];
  return logs.filter(log => log.level === level);
}

export function clearLogs(): void {
  logs = [];
}

export function exportLogs(): string {
  return JSON.stringify(logs, null, 2);
}
