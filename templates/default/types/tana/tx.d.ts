/**
 * tana/tx - Transaction Creation Module
 *
 * Create and stage transactions from contracts.
 */

export interface TransactionBuilder {
  /**
   * Create a new transaction
   *
   * @example
   * tx.create({
   *   type: 'transfer',
   *   to: 'usr_123',
   *   amount: 100,
   *   currency: 'USD'
   * })
   */
  create(data: {
    type: string
    to?: string
    amount?: number
    currency?: string
    [key: string]: unknown
  }): void

  /**
   * Stage multiple transactions atomically
   */
  batch(transactions: Array<{
    type: string
    to?: string
    amount?: number
    currency?: string
    [key: string]: unknown
  }>): void
}

/** Transaction builder instance */
export const tx: TransactionBuilder
