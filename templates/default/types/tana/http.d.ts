/**
 * tana/http - HTTP Response Helpers
 *
 * Helpers for creating HTTP responses in get/post handlers.
 */

export interface ResponseOptions {
  headers?: Record<string, string>
}

/** HTTP status codes and names */
export type StatusName =
  | 'ok' | 'created' | 'accepted' | 'noContent'
  | 'movedPermanently' | 'found' | 'seeOther' | 'notModified' | 'temporaryRedirect' | 'permanentRedirect'
  | 'badRequest' | 'unauthorized' | 'forbidden' | 'notFound' | 'methodNotAllowed' | 'conflict' | 'gone' | 'unprocessableEntity' | 'tooManyRequests'
  | 'internalServerError' | 'notImplemented' | 'badGateway' | 'serviceUnavailable' | 'gatewayTimeout'

/**
 * Create an HTTP response with a status code
 *
 * @example
 * // By name
 * return status('notFound')
 * return status('ok', { message: 'Hello' })
 *
 * // By number
 * return status(201, { id: 123 })
 * return status(404)
 */
export function status(code: StatusName | number, body?: unknown, options?: ResponseOptions): Response

/**
 * Create a JSON response (200 OK)
 *
 * @example
 * return json({ users: [...] })
 */
export function json(data: unknown, options?: ResponseOptions): Response

/**
 * Create an HTML response (200 OK)
 *
 * @example
 * return html('<h1>Hello</h1>')
 */
export function html(content: string, options?: ResponseOptions): Response

/**
 * Create a text response (200 OK)
 *
 * @example
 * return text('Hello, World!')
 */
export function text(content: string, options?: ResponseOptions): Response
