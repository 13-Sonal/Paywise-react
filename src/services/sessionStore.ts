import type { CurrentUser } from '@/types/auth'

/**
 * Holds the signed-in user's JWT and profile **in memory only**.
 *
 * Nothing is written to localStorage or sessionStorage, so the token can't be
 * read by other scripts later and disappears when the tab is closed or
 * refreshed (the user signs in again). A future improvement is for Rails to
 * put the token in an HttpOnly cookie instead.
 */
export interface Session {
  token: string
  user: CurrentUser
}

let currentSession: Session | null = null
const expiryListeners = new Set<() => void>()

export function getSession(): Session | null {
  return currentSession
}

export function setSession(session: Session): void {
  currentSession = session
}

export function clearSession(): void {
  currentSession = null
}

/** Called by the API client when Rails rejects the token (expired or invalid). */
export function expireSession(): void {
  currentSession = null
  expiryListeners.forEach((listener) => listener())
}

/** Subscribe to session expiry. Returns an unsubscribe function. */
export function onSessionExpired(listener: () => void): () => void {
  expiryListeners.add(listener)
  return () => {
    expiryListeners.delete(listener)
  }
}
