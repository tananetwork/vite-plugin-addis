/**
 * tana/context - Execution Context Module
 *
 * Access contract execution context (owner, caller, block info).
 */

export interface ExecutionContext {
  /**
   * Get the contract owner's address
   *
   * @example
   * const owner = context.owner()
   */
  owner(): string

  /**
   * Get the current caller's address
   *
   * @example
   * const caller = context.caller()
   */
  caller(): string

  /**
   * Get current block information
   *
   * @example
   * const { height, timestamp } = context.block()
   */
  block(): {
    height: number
    timestamp: number
    hash: string
  }

  /**
   * Get execution input data
   *
   * @example
   * const input = context.input()
   */
  input(): unknown
}

/** Execution context instance */
export const context: ExecutionContext
