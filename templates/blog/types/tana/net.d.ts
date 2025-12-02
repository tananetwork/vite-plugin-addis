/**
 * tana/net - HTTP Request Types
 *
 * Types for HTTP request objects in get/post handlers.
 */

export interface Request {
  /** Request URL path (e.g., '/api/users/123') */
  path: string

  /** Query string parameters */
  query: Record<string, string>

  /** URL path parameters (e.g., { id: '123' }) */
  params: Record<string, string>

  /** Request headers */
  headers: Record<string, string>

  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

  /** Request body (for POST/PUT/PATCH) */
  body?: unknown

  /** Parse JSON body */
  json<T = unknown>(): Promise<T>
}

export interface Response {
  status: number
  body: unknown
  headers: Record<string, string>
}
