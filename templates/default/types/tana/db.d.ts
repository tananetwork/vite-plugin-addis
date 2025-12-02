/**
 * tana/db - PostgreSQL Database Module
 *
 * For full type-safe queries with schema inference,
 * install @tananetwork/db and define your schema.
 */

/** Execute a SELECT query and return rows */
export function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]>

/** Execute INSERT/UPDATE/DELETE and return affected count */
export function execute(
  sql: string,
  params?: unknown[]
): Promise<number>

/** Execute with RETURNING clause and return rows */
export function executeReturning<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]>
