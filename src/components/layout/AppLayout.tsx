import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/** Shell for every signed-in page: sidebar, top bar and the routed page in <Outlet />. */
export function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  // Close the mobile drawer with the Escape key.
  useEffect(() => {
    if (!isNavigationOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsNavigationOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isNavigationOpen])

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <Sidebar isMobileOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onOpenNavigation={() => setIsNavigationOpen(true)} />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      {/* Scrolls to the top on navigation and restores position on back/forward. */}
      <ScrollRestoration />
    </div>
  )
}
