import { useEffect, useState, type ReactNode } from 'react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { forgetSignedInData } from '@/features/authentication/useCurrentUser'
import { onSessionExpired } from '@/services/sessionStore'
import { createQueryClient } from './queryClient'

/** App-wide React context providers. Add new global providers here. */
export function AppProviders({ children, queryClient }: { children: ReactNode; queryClient?: QueryClient }) {
  // useState makes sure the client is created once, not on every render.
  const [client] = useState(() => queryClient ?? createQueryClient())

  // When Rails rejects the token, forget cached data and mark the user signed out.
  // ProtectedRoute then redirects to /login.
  useEffect(() => onSessionExpired(() => forgetSignedInData(client)), [client])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
