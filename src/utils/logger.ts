/**
 * Structured Logger for Frontend Apps
 * 
 * Replaces console.log/error/warn with structured, production-safe logging.
 * In development, logs are printed to console. In production, only errors and warnings are logged.
 * 
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.info('User logged in', { userId: '123' });
 *   logger.error('Failed to fetch data', { error, endpoint: '/api/users' });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isProduction: boolean;
  private minLevel: LogLevel;

  private static LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    this.isProduction = import.meta.env?.MODE === 'production' || 
                       process.env?.NODE_ENV === 'production';
    // In production, only log warn and error. In development, log everything.
    this.minLevel = this.isProduction ? 'warn' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.LOG_LEVELS[level] >= Logger.LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  /**
   * Log informational messages (development only)
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, context));
  }

  /**
   * Log warnings (production and development)
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  /**
   * Log errors (production and development)
   */
  error(message: string, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context));
  }

  /**
   * Create a child logger with persistent context
   * Useful for component-specific or feature-specific logging
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalFormat = this.formatMessage.bind(this);
    
    childLogger.formatMessage = (level: LogLevel, message: string, childContext?: LogContext) => {
      const mergedContext = { ...context, ...childContext };
      return originalFormat(level, message, mergedContext);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };

export default logger;
