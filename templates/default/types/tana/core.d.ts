/**
 * tana/core - Core Utilities Module
 *
 * Browser-like console API for logging.
 */

export interface Console {
  /**
   * Log a message
   *
   * @example
   * console.log('Hello from Tana!')
   */
  log(...args: unknown[]): void

  /**
   * Log an info message
   */
  info(...args: unknown[]): void

  /**
   * Log a warning message
   */
  warn(...args: unknown[]): void

  /**
   * Log an error message
   */
  error(...args: unknown[]): void

  /**
   * Log a debug message
   */
  debug(...args: unknown[]): void
}

/** Console instance */
export const console: Console
