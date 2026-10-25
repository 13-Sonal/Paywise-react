import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { testEmployees } from '@/test/railsApiStub'
import { renderApp } from '@/test/renderApp'

describe('EmployeeFormPage', () => {
  it('shows validation messages for every required field', async () => {
    const { user } = renderApp('/employees/new')

    await user.click(await screen.findByRole('button', { name: 'Create employee' }))

    for (const message of [
      'Name is required',
      'Email is required',
      'Designation is required',
      'Hire date is required',
      'Country is required',
      'Primary contact number is required',
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument()
    }
    expect(screen.getByLabelText(/Full name/)).toHaveAttribute('aria-invalid', 'true')
    // Optional fields are not flagged.
    expect(screen.getByLabelText(/Emergency contact number/)).not.toHaveAttribute('aria-invalid')
  })

  it('rejects an invalid email address', async () => {
    const { user } = renderApp('/employees/new')

    await user.type(await screen.findByLabelText(/Work email/), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Create employee' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('offers designations and countries from the API data', async () => {
    renderApp('/employees/new')

    const designationSelect = await screen.findByLabelText(/Designation/)
    expect(await screen.findByRole('option', { name: testEmployees[0].designation })).toBeInTheDocument()
    expect(designationSelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: testEmployees[0].country })).toBeInTheDocument()
  })

  it('says saving is unavailable instead of pretending to save', async () => {
    const { user } = renderApp('/employees/new')

    await user.type(await screen.findByLabelText(/Full name/), 'Meera Joshi')
    await user.type(screen.getByLabelText(/Work email/), 'new.hire.test@paywise.example')
    await screen.findByRole('option', { name: 'Data Analyst' })
    await user.selectOptions(screen.getByLabelText(/Designation/), 'Data Analyst')
    fireEvent.change(screen.getByLabelText(/Hire date/), { target: { value: '2026-10-01' } })
    await user.selectOptions(screen.getByLabelText(/Country/), 'India')
    await user.type(screen.getByLabelText(/Primary contact number/), '+91 98765 43210')
    await user.click(screen.getByRole('button', { name: 'Create employee' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('not available yet')
    expect(screen.getByRole('heading', { level: 1, name: 'Add employee' })).toBeInTheDocument()
  })

  it('prefills the form when editing', async () => {
    const employee = testEmployees[0]
    renderApp(`/employees/${employee.id}/edit`)

    expect(await screen.findByLabelText(/Full name/)).toHaveValue(employee.name)
    expect(screen.getByLabelText(/Work email/)).toHaveValue(employee.email)
    expect(screen.getByLabelText(/Country/)).toHaveValue(employee.country)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })
})
