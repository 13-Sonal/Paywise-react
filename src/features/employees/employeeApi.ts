import { z } from 'zod'
import { apiClient } from '@/services/apiClient'
import type { Employee, EmployeeInput } from '@/types/employee'
import { railsUserListSchema, toEmployee } from './railsUser'

/**
 * The single boundary between the UI and employee data (Rails `users`).
 *
 * `GET /api/v1/users` currently returns every user with no pagination, so the
 * list is downloaded once and searched/sorted/paged in the browser (see
 * `useEmployees.ts`). TODO(rails): add server-side pagination and search, then
 * send `ListParams` as query parameters here instead.
 */
export const employeeApi = {
  async listAll(): Promise<Employee[]> {
    const payload = await apiClient.get<unknown>('/api/v1/users')
    const parsed = railsUserListSchema.safeParse(payload)
    if (!parsed.success) {
      if (import.meta.env.DEV) console.error('Unexpected users response', z.treeifyError(parsed.error))
      throw new Error('The Paywise API returned users in an unexpected format.')
    }
    return parsed.data.map(toEmployee)
  },

  // TODO(rails): no create/update endpoints are exposed under /api/v1 yet.
  // These reject (rather than pretend to save) until they exist.
  async create(_input: EmployeeInput): Promise<Employee> {
    throw new Error('Saving employees is not available yet: the Paywise API has no create endpoint.')
  },

  async update(_id: string, _input: EmployeeInput): Promise<Employee> {
    throw new Error('Saving employees is not available yet: the Paywise API has no update endpoint.')
  },
}
