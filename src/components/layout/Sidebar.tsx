import { NavLink } from 'react-router'
import { Banknote, History, LayoutDashboard, Users, X, type LucideIcon } from 'lucide-react'
import { canViewSalaries } from '@/features/authentication/permissions'
import { useCurrentUser } from '@/features/authentication/useCurrentUser'
import { cn } from '@/utils/cn'
import { BrandMark } from './BrandMark'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  visible: boolean
}

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const { data: currentUser } = useCurrentUser()

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { to: '/employees', label: 'Employees', icon: Users, visible: true },
    { to: '/salaries', label: 'Salaries', icon: Banknote, visible: canViewSalaries(currentUser) },
    { to: '/salary-audits', label: 'Salary audits', icon: History, visible: canViewSalaries(currentUser) },
  ]

  return (
    <>
      {/* Dimmed backdrop behind the drawer on small screens */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" aria-hidden="true" onClick={onClose} />
      )}

      <aside
        id="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-950 text-brand-100 transition-transform lg:translate-x-0',
          // `invisible` keeps the hidden drawer out of the keyboard tab order on small screens.
          isMobileOpen ? 'translate-x-0' : 'invisible -translate-x-full lg:visible',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <BrandMark tone="light" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-brand-200 hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-brand-300/70 uppercase">Workspace</p>
          <ul className="space-y-1">
            {navItems
              .filter((item) => item.visible)
              .map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-white/10 text-white' : 'text-brand-200 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('size-4', isActive && 'text-accent-400')} aria-hidden="true" />
                        {label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>

        <p className="px-6 py-4 text-xs text-brand-300/70">Employee &amp; compensation management</p>
      </aside>
    </>
  )
}
