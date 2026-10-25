import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testEmployees as allEmployees } from '@/test/railsApiStub'
import { renderApp } from '@/test/renderApp'

/** Data rows of the employee table (skips the header row). */
function getBodyRows() {
  const table = screen.getByRole('table', { name: 'Employees' })
  return within(table).getAllByRole('row').slice(1)
}

function cellText(row: HTMLElement, columnIndex: number) {
  return within(row).getAllByRole('cell')[columnIndex].textContent
}

async function renderEmployeesPage() {
  const result = renderApp('/employees')
  await screen.findByText(/Page 1 of/)
  return result
}

describe('EmployeesPage', () => {
  it('renders the first page of employees with the expected columns', async () => {
    await renderEmployeesPage()

    for (const header of ['Employee', 'Email', 'Designation', 'Country', 'Hire date', 'Actions']) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument()
    }
    expect(getBodyRows()).toHaveLength(10)
    expect(screen.getByText(`Page 1 of ${Math.ceil(allEmployees.length / 10)}`)).toBeInTheDocument()

    // Sensitive fields stay off the list.
    expect(screen.queryByRole('columnheader', { name: /blood/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /contact/i })).not.toBeInTheDocument()
  })

  it('searches by email', async () => {
    const { user } = await renderEmployeesPage()
    const target = allEmployees[42]

    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), target.email)

    await waitFor(() => expect(getBodyRows()).toHaveLength(1))
    expect(screen.getByRole('link', { name: target.name })).toBeInTheDocument()
  })

  it('filters by country and designation', async () => {
    const { user } = await renderEmployeesPage()

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by country' }), 'Japan')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by designation' }),
      'Product Designer',
    )

    const expectedCount = allEmployees.filter(
      (employee) => employee.country === 'Japan' && employee.designation === 'Product Designer',
    ).length
    await screen.findByText((_, element) => element?.tagName === 'P' && element.textContent === `Showing 1–10 of ${expectedCount}`)

    for (const row of getBodyRows()) {
      expect(cellText(row, 2)).toBe('Product Designer')
      expect(cellText(row, 3)).toBe('Japan')
    }
  })

  it('shows an empty state when nothing matches, and clears it', async () => {
    const { user } = await renderEmployeesPage()

    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), 'no-such-person-xyz')
    expect(await screen.findByText('No employees match your search')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search and filters' }))
    await waitFor(() => expect(getBodyRows()).toHaveLength(10))
  })

  it('sorts by hire date when the column header is clicked', async () => {
    const { user } = await renderEmployeesPage()
    const hireDateHeader = screen.getByRole('columnheader', { name: 'Hire date' })

    await user.click(within(hireDateHeader).getByRole('button'))
    await waitFor(() => expect(hireDateHeader).toHaveAttribute('aria-sort', 'ascending'))

    const earliest = [...allEmployees].sort(
      (first, second) => first.hireDate.localeCompare(second.hireDate) || Number(first.id) - Number(second.id),
    )[0]
    await waitFor(() => expect(cellText(getBodyRows()[0], 0)).toContain(earliest.name))

    await user.click(within(hireDateHeader).getByRole('button'))
    await waitFor(() => expect(hireDateHeader).toHaveAttribute('aria-sort', 'descending'))
  })

  it('paginates and changes the page size', async () => {
    const { user } = await renderEmployeesPage()
    const totalPages = Math.ceil(allEmployees.length / 10)
    const firstRowOnPageOne = cellText(getBodyRows()[0], 1)

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(await screen.findByText(`Page 2 of ${totalPages}`)).toBeInTheDocument()
    await waitFor(() => expect(cellText(getBodyRows()[0], 1)).not.toBe(firstRowOnPageOne))

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25')
    expect(await screen.findByText(`Page 1 of ${Math.ceil(allEmployees.length / 25)}`)).toBeInTheDocument()
    expect(getBodyRows()).toHaveLength(25)
  })
})
