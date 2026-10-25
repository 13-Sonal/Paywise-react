import { vi } from 'vitest'
import { generateMockEmployees } from '@/mock/employees'
import type { Employee } from '@/types/employee'

const COUNTRY_CODES: Record<string, string> = {
  Australia: 'AU',
  Brazil: 'BR',
  Canada: 'CA',
  Germany: 'DE',
  India: 'IN',
  Japan: 'JP',
  Netherlands: 'NL',
  Singapore: 'SG',
  'United Kingdom': 'GB',
  'United States': 'US',
}

/** The employees the stubbed API returns, in frontend shape — use for expectations. */
export const testEmployees: Employee[] = generateMockEmployees().map((employee, index) => ({
  ...employee,
  id: String(index + 1),
}))

/** The same employees as Rails would serialise them (snake_case, numeric ids). */
function toRailsUser(employee: Employee, index: number) {
  return {
    id: index + 1,
    name: employee.name,
    email: employee.email,
    role_id: 1,
    role: { id: 1, name: employee.designation },
    hire_date: employee.hireDate,
    country_code: COUNTRY_CODES[employee.country],
    primary_contact_number: employee.primaryContactNumber,
    emergency_contact_number: employee.emergencyContactNumber,
    address: employee.address,
    blood_group: employee.bloodGroup,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
}

const railsUsers = testEmployees.map(toRailsUser)

/** One salary record per test employee, shaped like Rails `salary_records#index` today: decimal as string, no `user`. */
export const testSalaries = testEmployees.slice(0, 40).map((employee, index) => ({
  id: index + 1,
  user_id: Number(employee.id),
  compensation: `${(50000 + index * 1000).toFixed(1)}`,
  currency: 'USD',
  effective_from: employee.hireDate,
  role_id: 1,
  role: { id: 1, name: employee.designation },
}))

export const VALID_CREDENTIALS = { email: 'admin@paywise.example', password: 'correct-password' }
/** A real account whose role may not use Paywise. */
export const ENGINEER_CREDENTIALS = { email: 'engineer@paywise.example', password: 'correct-password' }

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Past salaries, shaped like Rails `employment_histories` (decimal as string, no `user`). */
export const testSalaryAudits = testEmployees.slice(0, 15).map((employee, index) => ({
  id: index + 1,
  user_id: Number(employee.id),
  company_name: index % 2 === 0 ? 'Paywise' : 'Acme Corp',
  designation: 'Associate Software Engineer',
  salary: `${(30000 + index * 500).toFixed(1)}`,
  currency: 'USD',
  // Index 0 is the most recent (2025, still open); older entries go back one year each.
  started_on: `${2025 - index}-04-01`,
  ended_on: index === 0 ? null : `${2026 - index}-03-31`,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}))

interface StubOptions {
  /** Status for GET /api/v1/users. 401 simulates an expired token. */
  usersStatus?: number
  /** Status for POST /api/v1/salaries (salary update). */
  salaryUpdateStatus?: number
}

/**
 * Replaces `fetch` with a tiny fake Rails API:
 *   POST /api/v1/login  → token for VALID_CREDENTIALS, 401 otherwise
 *   GET  /api/v1/users     → the test employees (requires a Bearer token)
 *   GET  /api/v1/salaries  → the test salary records (requires a Bearer token)
 *   POST /api/v1/salaries  → 200 (or `salaryUpdateStatus`)
 *   GET  /api/v1/historic_records → the test salary audits (employment histories)
 */
export function stubRailsApi({
  usersStatus = 200,
  salaryUpdateStatus = 200,
}: StubOptions = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    const method = init?.method ?? 'GET'
    const headers = new Headers(init?.headers)

    if (method === 'POST' && url.pathname === '/api/v1/login') {
      const body = JSON.parse(String(init?.body)) as { email: string; password: string }
      const roleByEmail: Record<string, string> = {
        [VALID_CREDENTIALS.email]: 'Admin',
        [ENGINEER_CREDENTIALS.email]: 'Software Engineer',
      }
      if (roleByEmail[body.email] && body.password === VALID_CREDENTIALS.password) {
        return jsonResponse({
          token: 'test-jwt',
          // Mirrors Api::V1::SessionsController#create.
          user: { id: 99, name: 'Asha Admin', email: body.email, role_id: 1, role_name: roleByEmail[body.email] },
        })
      }
      return jsonResponse({ error: 'Invalid email or password' }, 401)
    }

    if (method === 'GET' && url.pathname === '/api/v1/users') {
      if (!headers.get('Authorization')?.startsWith('Bearer ')) return jsonResponse({ error: 'Unauthorized' }, 401)
      if (usersStatus !== 200) return jsonResponse({ error: 'Unauthorized' }, usersStatus)
      return jsonResponse(railsUsers)
    }

    if (method === 'GET' && url.pathname === '/api/v1/salaries') {
      if (!headers.get('Authorization')?.startsWith('Bearer ')) return jsonResponse({ error: 'Unauthorized' }, 401)
      return jsonResponse(testSalaries)
    }

    if (method === 'POST' && url.pathname === '/api/v1/salaries') {
      if (salaryUpdateStatus === 422) return jsonResponse({ errors: ['Compensation must be greater than 0'] }, 422)
      return jsonResponse({}, salaryUpdateStatus)
    }

    if (method === 'GET' && url.pathname === '/api/v1/historic_records') {
      if (!headers.get('Authorization')?.startsWith('Bearer ')) return jsonResponse({ error: 'Unauthorized' }, 401)
      return jsonResponse(testSalaryAudits)
    }

    return jsonResponse({ error: 'Not found' }, 404)
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
