import type { CurrentUser, RoleName } from '@/types/auth'

/**
 * Which roles may do what in the UI. Role names must match the Rails `roles`
 * table (sent as `role_name` at sign-in).
 *
 * This only decides what the UI shows. Rails must enforce the same rules on
 * every endpoint, because anyone can call the API directly.
 */
/** Only these roles may sign in to Paywise at all. */
export const SIGN_IN_ROLES: readonly RoleName[] = ['Admin', 'HR Manager', 'HR']
const SALARY_VIEWER_ROLES: readonly RoleName[] = ['Admin', 'HR Manager', 'HR']
const SALARY_EDITOR_ROLES: readonly RoleName[] = ['Admin', 'HR Manager']

export function canSignIn(user: CurrentUser | null | undefined): boolean {
  return !!user && SIGN_IN_ROLES.includes(user.role)
}

export function canViewSalaries(user: CurrentUser | null | undefined): boolean {
  return !!user && SALARY_VIEWER_ROLES.includes(user.role)
}

export function canEditSalaries(user: CurrentUser | null | undefined): boolean {
  return !!user && SALARY_EDITOR_ROLES.includes(user.role)
}
