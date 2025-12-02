/**
 * tana/kv - Key-Value Storage Module
 *
 * Cloudflare Workers-compatible KV storage API.
 */

export interface KVNamespace {
  /**
   * Get a value from KV storage
   *
   * @example
   * const value = await kv.get('user:123')
   */
  get(key: string): Promise<string | null>
  get(key: string, type: 'text'): Promise<string | null>
  get(key: string, type: 'json'): Promise<unknown | null>
  get<T = unknown>(key: string, type: 'json'): Promise<T | null>

  /**
   * Put a value in KV storage
   *
   * @example
   * await kv.put('user:123', JSON.stringify({ name: 'Alice' }))
   */
  put(key: string, value: string): Promise<void>
  put(key: string, value: string, options: { expirationTtl?: number }): Promise<void>

  /**
   * Delete a value from KV storage
   *
   * @example
   * await kv.delete('user:123')
   */
  delete(key: string): Promise<void>

  /**
   * List keys in KV storage
   *
   * @example
   * const { keys } = await kv.list({ prefix: 'user:' })
   */
  list(options?: {
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<{
    keys: Array<{ name: string; expiration?: number }>
    list_complete: boolean
    cursor?: string
  }>
}

/** KV storage instance */
export const kv: KVNamespace
