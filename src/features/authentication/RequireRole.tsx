import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import type { CurrentUser } from '@/types/auth'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCurrentUser } from './useCurrentUser'

interface RequireRoleProps {
  isAllowed: (user: CurrentUser | null | undefined) => boolean
  children: ReactNode
}

/** Hides a screen from users whose role shouldn't see it. UI only — Rails enforces access. */
export function RequireRole({ isAllowed, children }: RequireRoleProps) {
  const { data: currentUser } = useCurrentUser()

  if (!isAllowed(currentUser)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this page"
        description="Ask a Paywise administrator if you believe you should."
      />
    )
  }

  return children
}
