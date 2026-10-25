import { appConfig } from '@/config/appConfig'
import { expireSession, getSession } from './sessionStore'

/**
 * Thin wrapper around `fetch` for talking to the Rails API.
 *
 * - Adds `Authorization: Bearer <token>` when someone is signed in.
 * - If Rails answers 401 to an authenticated request, the session is expired
 *   and the app sends the user back to the login page.
 */
export class ApiError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/**
 * A readable message for an error thrown by `apiClient`, using what Rails sent:
 * `{ errors: { compensation: ["must be greater than 0"] } }`, `{ errors: [...] }` or `{ error: "..." }`.
 */
export function describeApiError(error: unknown, messagesByStatus: Partial<Record<number, string>> = {}): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : 'Something went wrong.'
  if (messagesByStatus[error.status]) return messagesByStatus[error.status] as string

  const details = error.details as { error?: unknown; errors?: unknown } | null
  if (typeof details?.error === 'string') return details.error
  if (Array.isArray(details?.errors)) return details.errors.join('. ')
  if (details?.errors && typeof details.errors === 'object') {
    return Object.entries(details.errors as Record<string, unknown>)
      .map(([field, messages]) => `${field.replace(/_/g, ' ')} ${([] as unknown[]).concat(messages).join(', ')}`)
      .join('. ')
  }
  return error.message
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface RequestOptions {
  body?: unknown
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  // An empty base URL means "same origin" — in development Vite proxies /api to Rails.
  const url = new URL(`${appConfig.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function request<TResponse>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<TResponse> {
  const token = getSession()?.token

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch {
    throw new ApiError('Could not reach the Paywise API. Is the Rails server running?', 0, null)
  }

  const isJson = response.headers.get('Content-Type')?.includes('application/json') ?? false
  const payload: unknown = isJson ? await response.json() : null

  if (response.status === 401 && token) {
    expireSession()
    throw new ApiError('Your session has expired. Please sign in again.', 401, payload)
  }

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, payload)
  }
  return payload as TResponse
}

export const apiClient = {
  get: <TResponse>(path: string, options?: Omit<RequestOptions, 'body'>) => request<TResponse>('GET', path, options),
  post: <TResponse>(path: string, body: unknown) => request<TResponse>('POST', path, { body }),
  patch: <TResponse>(path: string, body: unknown) => request<TResponse>('PATCH', path, { body }),
  delete: <TResponse>(path: string) => request<TResponse>('DELETE', path),
}
