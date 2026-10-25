import { Navigate, type RouteObject } from 'react-router'
import { ProtectedRoute } from '@/features/authentication/ProtectedRoute'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { AppLayout } from '@/components/layout/AppLayout'

/**
 * Each page is loaded on demand (code splitting), so the first download only
 * contains what the current screen needs. `lazy` returns `{ Component }`.
 */
const pages = {
  login: async () => ({ Component: (await import('@/pages/LoginPage')).LoginPage }),
  dashboard: async () => ({ Component: (await import('@/pages/DashboardPage')).DashboardPage }),
  employees: async () => ({ Component: (await import('@/pages/EmployeesPage')).EmployeesPage }),
  employeeDetails: async () => ({ Component: (await import('@/pages/EmployeeDetailsPage')).EmployeeDetailsPage }),
  employeeForm: async () => ({ Component: (await import('@/pages/EmployeeFormPage')).EmployeeFormPage }),
  salaries: async () => ({ Component: (await import('@/pages/SalariesPage')).SalariesPage }),
  salaryAudits: async () => ({ Component: (await import('@/pages/SalaryAuditsPage')).SalaryAuditsPage }),
  notFound: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
}

/** Shown while a page's code is fetched on first visit. */
const pageLoading = <FullPageSpinner label="Loading" />

/**
 * Route table. Kept separate from `router.tsx` so tests can mount the same
 * routes in a memory router.
 */
export const routes: RouteObject[] = [
  { path: '/login', lazy: pages.login, hydrateFallbackElement: pageLoading },
  {
    // Everything below requires a signed-in user.
    element: <ProtectedRoute />,
    hydrateFallbackElement: pageLoading,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', lazy: pages.dashboard },
          { path: '/employees', lazy: pages.employees },
          { path: '/employees/new', lazy: pages.employeeForm },
          { path: '/employees/:id', lazy: pages.employeeDetails },
          { path: '/employees/:id/edit', lazy: pages.employeeForm },
          { path: '/salaries', lazy: pages.salaries },
          { path: '/salary-audits', lazy: pages.salaryAudits },
          { path: '*', lazy: pages.notFound },
        ],
      },
    ],
  },
]
