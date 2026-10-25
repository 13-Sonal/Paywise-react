import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useCurrentUser, useSignOut } from '@/features/authentication/useCurrentUser'
import { Avatar } from '@/components/ui/Avatar'

export function Topbar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const signOut = useSignOut()

  function handleSignOut() {
    signOut.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenNavigation}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
        aria-controls="app-sidebar"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {currentUser && (
          <div className="flex items-center gap-3">
            <Avatar name={currentUser.name} />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.role}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signOut.isPending}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
