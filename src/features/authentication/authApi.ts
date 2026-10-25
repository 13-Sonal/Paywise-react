import { z } from 'zod'
import { ApiError, apiClient } from '@/services/apiClient'
import { clearSession, getSession, setSession } from '@/services/sessionStore'
import type { CurrentUser, SignInCredentials } from '@/types/auth'
import { canSignIn, SIGN_IN_ROLES } from './permissions'


const SIGN_IN_PATH = '/api/v1/login'

const signInResponseSchema = z.object({
  token: z.string().min(1),
  user: z.object({
    id: z.union([z.number(), z.string()]).transform(String),
    name: z.string(),
    email: z.string(),
    role_name: z.string().nullable().optional(),
    role_id: z.number().nullable().optional(),
  }),
})

type SignInResponse = z.infer<typeof signInResponseSchema>

/** Without a role name we can't check permissions, so show the id and grant no extra access. */
function toCurrentUser({ role_name, role_id, ...user }: SignInResponse['user']): CurrentUser {
  return { ...user, role: role_name?.trim() || (role_id ? `Role #${role_id}` : 'Unknown role') }
}

export const authApi = {
  /** There is no "current user" endpoint yet, so the session lives in memory after sign-in. */
  async fetchCurrentUser(): Promise<CurrentUser | null> {
    return getSession()?.user ?? null
  },

  async signIn(credentials: SignInCredentials): Promise<CurrentUser> {
    let payload: unknown
    try {
      payload = await apiClient.post<unknown>(SIGN_IN_PATH, credentials)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) throw new Error('Invalid email or password.')
      if (error instanceof ApiError && error.status === 404) {
        throw new Error('The sign-in endpoint is not available on the Paywise API yet.')
      }
      throw error
    }

    const parsed = signInResponseSchema.safeParse(payload)
    if (!parsed.success) {
      // Shows exactly which field didn't match, in the browser console (development only).
      if (import.meta.env.DEV) console.error('Unexpected sign-in response', z.treeifyError(parsed.error), payload)
      throw new Error('Unexpected sign-in response from the Paywise API.')
    }

    const user = toCurrentUser(parsed.data.user)
    // Rails accepted the password, but only some roles may use Paywise. The token is discarded.
    if (!canSignIn(user)) {
      throw new Error(`Your account doesn't have access to Paywise. Only ${SIGN_IN_ROLES.join(', ')} users can sign in.`)
    }
    setSession({ token: parsed.data.token, user })
    return user
  },

  /** JWTs are stateless, so signing out just forgets the token. */
  async signOut(): Promise<void> {
    clearSession()
  },

  // Google SSO is postponed — we use email/password sign-in for now.
  // startGoogleSignIn() {
  //   window.location.assign(`${appConfig.apiBaseUrl}/<google-sso-path>`)
  // },
}
