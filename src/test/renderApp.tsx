import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers'
import { routes } from '@/app/routes'
import { setSession } from '@/services/sessionStore'

export const TEST_ADMIN = { id: '99', name: 'Asha Admin', email: 'admin@paywise.example', role: 'Admin' }

/**
 * Renders the whole app (real routes, layout and providers) at `path`.
 * A memory router replaces the browser URL bar, so tests can navigate freely.
 * `fetch` is stubbed in setup.ts with a fake Rails API.
 */
export function renderApp(path: string, { signedIn = true, role = TEST_ADMIN.role } = {}) {
  if (signedIn) setSession({ token: 'test-jwt', user: { ...TEST_ADMIN, role } })

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()

  render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { user, router }
}
