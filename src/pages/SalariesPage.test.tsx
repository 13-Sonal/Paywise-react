import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { stubRailsApi, testEmployees, testSalaries, testSalaryAudits } from '@/test/railsApiStub'
import { renderApp } from '@/test/renderApp'

/** Salary rows only carry `user_id`; the page looks the name up in the users list. */
const nameOf = (userId: number) => testEmployees.find((employee) => employee.id === String(userId))?.name ?? ''

function getBodyRows(tableName: string) {
  const table = screen.getByRole('table', { name: tableName })
  return within(table).getAllByRole('row').slice(1)
}

async function waitForCurrentSalaries() {
  const pagination = await screen.findByRole('navigation', { name: 'Current salaries pagination' })
  return pagination
}

describe('SalariesPage — current salaries', () => {
  it('shows salary records with employee names and formatted compensation', async () => {
    renderApp('/salaries')
    await waitForCurrentSalaries()

    expect(getBodyRows('Employee compensation')).toHaveLength(10)
    const first = [...testSalaries].sort(
      (a, b) => nameOf(a.user_id).localeCompare(nameOf(b.user_id)) || a.id - b.id,
    )[0]
    const firstRow = getBodyRows('Employee compensation')[0]
    expect(firstRow).toHaveTextContent(nameOf(first.user_id))
    expect(firstRow).not.toHaveTextContent('User #')
    expect(firstRow).toHaveTextContent(`$${Number(first.compensation).toLocaleString('en-US')}`)
    expect(firstRow).toHaveTextContent(first.role.name)
  })

  it('searches by employee name', async () => {
    const { user } = renderApp('/salaries')
    const targetName = nameOf(testSalaries[7].user_id)
    await waitForCurrentSalaries()

    await user.type(screen.getByRole('searchbox', { name: 'Search salaries by employee' }), targetName)

    await waitFor(() => {
      for (const row of getBodyRows('Employee compensation')) expect(row).toHaveTextContent(targetName)
    })
  })
})

describe('SalariesPage — roles', () => {
  it('lets HR see salaries but not update them', async () => {
    renderApp('/salaries', { role: 'HR' })
    await waitForCurrentSalaries()

    expect(screen.getByRole('link', { name: 'Salaries' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Update salary for/ })).not.toBeInTheDocument()
  })

  it('sends other roles to the login page instead of showing salaries', async () => {
    renderApp('/salaries', { role: 'Software Engineer' })

    expect(await screen.findByRole('heading', { name: 'Welcome to Paywise' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('lets an HR Manager update a salary', async () => {
    const fetchMock = stubRailsApi()
    const { user } = renderApp('/salaries', { role: 'HR Manager' })
    await waitForCurrentSalaries()

    await user.click(screen.getAllByRole('button', { name: /Update salary for/ })[0])
    const dialog = screen.getByRole('dialog', { name: 'Update salary' })
    const compensation = within(dialog).getByLabelText(/Annual compensation/)
    await user.clear(compensation)
    await user.type(compensation, '123456')
    await user.click(within(dialog).getByRole('button', { name: 'Save salary' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const updateCall = fetchMock.mock.calls.find(
      ([url, init]) => init?.method === 'POST' && String(url).endsWith('/api/v1/salaries'),
    )
    expect(JSON.parse(String(updateCall?.[1]?.body))).toMatchObject({
      id: expect.any(String),
      salary_record: { compensation: 123456, currency: 'USD' },
    })
  })

  it('validates the salary form', async () => {
    const { user } = renderApp('/salaries', { role: 'HR Manager' })
    await waitForCurrentSalaries()

    await user.click(screen.getAllByRole('button', { name: /Update salary for/ })[0])
    const dialog = screen.getByRole('dialog', { name: 'Update salary' })
    await user.clear(within(dialog).getByLabelText(/Annual compensation/))
    await user.clear(within(dialog).getByLabelText(/Currency/))
    await user.type(within(dialog).getByLabelText(/Currency/), 'R1')
    await user.click(within(dialog).getByRole('button', { name: 'Save salary' }))

    expect(await within(dialog).findByText('Compensation is required')).toBeInTheDocument()
    expect(within(dialog).getByText('Use a 3-letter currency code, e.g. INR')).toBeInTheDocument()
  })

  it('explains when Rails refuses the update for this role', async () => {
    stubRailsApi({ salaryUpdateStatus: 403 })
    const { user } = renderApp('/salaries', { role: 'HR Manager' })
    await waitForCurrentSalaries()

    await user.click(screen.getAllByRole('button', { name: /Update salary for/ })[0])
    await user.click(screen.getByRole('button', { name: 'Save salary' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("You don't have permission to update salaries.")
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows Rails validation errors', async () => {
    stubRailsApi({ salaryUpdateStatus: 422 })
    const { user } = renderApp('/salaries', { role: 'HR Manager' })
    await waitForCurrentSalaries()

    await user.click(screen.getAllByRole('button', { name: /Update salary for/ })[0])
    await user.click(screen.getByRole('button', { name: 'Save salary' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Compensation must be greater than 0')
  })
})

describe('SalaryAuditsPage', () => {
  it('is reachable from the sidebar', async () => {
    const { user } = renderApp('/salaries', { role: 'HR' })
    const mainNavigation = await screen.findByRole('navigation', { name: 'Main' })

    await user.click(within(mainNavigation).getByRole('link', { name: 'Salary audits' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Salary audits' })).toBeInTheDocument()
    expect(screen.queryByRole('table', { name: 'Employee compensation' })).not.toBeInTheDocument()
  })

  it('lists past salaries with name, designation and salary', async () => {
    renderApp('/salary-audits', { role: 'HR' })

    await screen.findByRole('navigation', { name: 'Salary audits pagination' })
    const rows = getBodyRows('Salary audits')
    expect(rows).toHaveLength(10)

    // Newest first: the open-ended entry (no end date) is the first row and shows "Present".
    const newest = testSalaryAudits[0]
    expect(rows[0]).toHaveTextContent(nameOf(newest.user_id))
    expect(rows[0]).toHaveTextContent('Associate Software Engineer')
    expect(rows[0]).toHaveTextContent('$30,000')
    expect(rows[0]).toHaveTextContent('Present')
  })
})
