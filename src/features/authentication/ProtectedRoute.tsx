import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { canSignIn } from './permissions'
import { useCurrentUser } from './useCurrentUser'

/**
 * Wraps every signed-in route. Sends visitors without a session to /login.
 *
 * This is a user-experience guard only. The real security boundary is Rails,
 * which must reject unauthenticated or unauthorised API requests.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const { data: currentUser, isPending, isError, refetch } = useCurrentUser()

  if (isPending) return <FullPageSpinner label="Checking your session" />

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState title="We couldn't check your session" onRetry={() => void refetch()} />
      </div>
    )
  }

  // A session with a role that may not use Paywise is treated as signed out.
  if (!currentUser || !canSignIn(currentUser)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
