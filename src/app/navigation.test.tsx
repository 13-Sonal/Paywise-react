import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getSession } from '@/services/sessionStore'
import { ENGINEER_CREDENTIALS, stubRailsApi, testEmployees, VALID_CREDENTIALS } from '@/test/railsApiStub'
import { renderApp } from '@/test/renderApp'

describe('sign in', () => {
  it('sends signed-out visitors to the login page', async () => {
    renderApp('/salaries', { signedIn: false })

    expect(await screen.findByRole('heading', { name: 'Welcome to Paywise' })).toBeInTheDocument()
    expect(screen.queryByText(/Compensation/)).not.toBeInTheDocument()
  })

  it('requires email and password', async () => {
    const { user } = renderApp('/login', { signedIn: false })

    await user.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('shows an error for wrong credentials', async () => {
    const { user, router } = renderApp('/login', { signedIn: false })

    await user.type(await screen.findByLabelText(/Email/), VALID_CREDENTIALS.email)
    await user.type(screen.getByLabelText(/Password/), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(router.state.location.pathname).toBe('/login')
  })

  it('refuses roles other than Admin, HR and HR Manager', async () => {
    const { user, router } = renderApp('/login', { signedIn: false })

    await user.type(await screen.findByLabelText(/Email/), ENGINEER_CREDENTIALS.email)
    await user.type(screen.getByLabelText(/Password/), ENGINEER_CREDENTIALS.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("doesn't have access to Paywise")
    expect(router.state.location.pathname).toBe('/login')
    expect(getSession()).toBeNull()
  })

  it('signs in and returns to the page the user asked for', async () => {
    const fetchMock = stubRailsApi()
    const { user } = renderApp('/employees', { signedIn: false })

    await user.type(await screen.findByLabelText(/Email/), VALID_CREDENTIALS.email)
    await user.type(screen.getByLabelText(/Password/), VALID_CREDENTIALS.password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Employees' })).toBeInTheDocument()
    expect(await screen.findByText(/Page 1 of/)).toBeInTheDocument()

    // The users request carries the JWT from the login response.
    const usersCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/api/v1/users'))
    expect(new Headers(usersCall?.[1]?.headers).get('Authorization')).toBe('Bearer test-jwt')
  })

  it('returns to the login page when the API rejects the token', async () => {
    stubRailsApi({ usersStatus: 401 })
    renderApp('/employees')

    expect(await screen.findByRole('heading', { name: 'Welcome to Paywise' })).toBeInTheDocument()
  })
})

describe('navigation', () => {
  it('moves between the main screens', async () => {
    const { user } = renderApp('/dashboard')
    const mainNavigation = await screen.findByRole('navigation', { name: 'Main' })

    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
    expect(await screen.findByText('Total employees')).toBeInTheDocument()

    await user.click(within(mainNavigation).getByRole('link', { name: 'Employees' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Employees' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Add Employee' }))
    // The form page is lazy-loaded, so allow extra time on first visit.
    expect(await screen.findByRole('heading', { level: 1, name: 'Add employee' }, { timeout: 5000 })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Employees' })).toBeInTheDocument()

    await user.click(within(mainNavigation).getByRole('link', { name: 'Salaries' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Salaries' })).toBeInTheDocument()
    expect(await screen.findByRole('columnheader', { name: 'Compensation' })).toBeInTheDocument()
  })

  it('opens an employee from the list and goes to the edit page', async () => {
    const { user } = renderApp('/employees')

    await screen.findByText(/Page 1 of/)
    const table = screen.getByRole('table', { name: 'Employees' })
    const viewLink = within(table).getAllByRole('link', { name: /^View / })[0]
    const employeeName = viewLink.getAttribute('aria-label')?.replace('View ', '') ?? ''

    await user.click(viewLink)
    expect(await screen.findByRole('heading', { level: 1, name: employeeName })).toBeInTheDocument()
    expect(screen.getByText('Blood group')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Edit' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Edit employee' })).toBeInTheDocument()
  })

  it('shows "not found" for an unknown employee id', async () => {
    renderApp('/employees/does-not-exist')

    expect(await screen.findByText('Employee not found')).toBeInTheDocument()
  })

  it('shows dashboard totals from the API and never shows compensation', async () => {
    renderApp('/dashboard')

    expect(await screen.findByText(testEmployees.length.toLocaleString('en-US'))).toBeInTheDocument()
    expect(within(screen.getByRole('main')).queryByText(/salary|salaries|compensation/i)).not.toBeInTheDocument()
  })
})
