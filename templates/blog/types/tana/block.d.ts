/**
 * tana/block - Blockchain Query Module
 *
 * Read-only access to blockchain state.
 */

export interface User {
  id: string
  username: string
  name?: string
  bio?: string
  role: 'sovereign' | 'staff' | 'user'
  publicKey: string
  createdAt: string
}

export interface Balance {
  userId: string
  currency: string
  amount: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: string
  from?: string
  to?: string
  amount?: string
  currency?: string
  data?: unknown
  timestamp: string
  blockHeight: number
}

export interface BlockQuery {
  /**
   * Get user by ID
   *
   * @example
   * const user = await block.getUser('usr_123')
   */
  getUser(userId: string): Promise<User | null>

  /**
   * Get user balance
   *
   * @example
   * const balance = await block.getBalance('usr_123', 'USD')
   */
  getBalance(userId: string, currency: string): Promise<Balance | null>

  /**
   * Get transaction by ID
   *
   * @example
   * const tx = await block.getTransaction('tx_abc')
   */
  getTransaction(txId: string): Promise<Transaction | null>

  /**
   * Get current block height
   */
  height(): Promise<number>
}

/** Block query instance */
export const block: BlockQuery
