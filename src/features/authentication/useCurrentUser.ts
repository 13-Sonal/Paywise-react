import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { SignInCredentials } from '@/types/auth'
import { authApi } from './authApi'

export const sessionKey = ['session'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: () => authApi.fetchCurrentUser(),
    staleTime: Infinity,
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: SignInCredentials) => authApi.signIn(credentials),
    onSuccess: (user) => queryClient.setQueryData(sessionKey, user),
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => forgetSignedInData(queryClient),
  })
}

/**
 * Marks the user signed out and drops every other cached response, so no
 * employee or salary data survives sign-out. The session entry is updated
 * (not removed) so mounted components notice the change and redirect.
 */
export function forgetSignedInData(queryClient: QueryClient): void {
  queryClient.setQueryData(sessionKey, null)
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionKey[0] })
}
