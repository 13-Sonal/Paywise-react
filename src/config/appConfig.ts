/**
 * Central place for runtime configuration.
 *
 * Values come from Vite environment variables (see `.env.example`). Anything
 * prefixed with `VITE_` is embedded in the browser bundle and is therefore
 * public — never put secrets here.
 */
export const appConfig = {
  /**
   * Base URL of the Rails API (paywise-api). Leave empty to call the same
   * origin — in development, Vite proxies `/api` to Rails (see vite.config.ts).
   * Used only by `services/apiClient.ts`.
   */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
} as const
