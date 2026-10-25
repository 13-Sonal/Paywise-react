import { z } from 'zod'
import { apiClient, describeApiError } from '@/services/apiClient'
import type { SalaryAudit, SalaryRecord, SalaryUpdate } from '@/types/salary'
import { railsEmploymentHistoryListSchema, toSalaryAudit } from './railsEmploymentHistory'
import { railsSalaryRecordListSchema, toSalaryRecord } from './railsSalaryRecord'

/**
 * Boundary between the UI and salary data.
 *
 * The list endpoints return everything with no pagination, so lists are
 * downloaded once and searched/sorted/paged in the browser (see
 * `useSalaries.ts`). TODO(rails): add server-side pagination and search.
 * Rails must restrict all of these endpoints by role.
 */
const SALARIES_PATH = '/api/v1/salaries'

/**
 * Salary update: Rails `salary_records#update`, Admin and HR Manager only.
 *   POST /api/v1/salaries  { "id", "salary_record": { "compensation", "currency", "effective_from" } }
 *        → 200, 403, 404 { "error": "Salary record not found" }, or 422 { "errors": ["Compensation must be greater than 0"] }
 */

/** Salary audits: Rails `employment_histories#index`. */
const SALARY_AUDITS_PATH = '/api/v1/historic_records'

function parseOrThrow<TSchema extends z.ZodType>(schema: TSchema, payload: unknown, what: string): z.output<TSchema> {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    if (import.meta.env.DEV) console.error(`Unexpected ${what} response`, z.treeifyError(parsed.error))
    throw new Error(`The Paywise API returned ${what} in an unexpected format.`)
  }
  return parsed.data
}

export const salaryApi = {
  async listAll(): Promise<SalaryRecord[]> {
    const payload = await apiClient.get<unknown>(SALARIES_PATH)
    return parseOrThrow(railsSalaryRecordListSchema, payload, 'salaries').map(toSalaryRecord)
  },

  async update(id: string, update: SalaryUpdate): Promise<void> {
    try {
      await apiClient.post<unknown>(SALARIES_PATH, {
        id,
        salary_record: {
          compensation: update.compensation,
          currency: update.currency,
          effective_from: update.effectiveDate,
        },
      })
    } catch (error) {
      throw new Error(
        describeApiError(error, { 403: "You don't have permission to update salaries." }),
        { cause: error },
      )
    }
  },

  async listAudits(): Promise<SalaryAudit[]> {
    let payload: unknown
    try {
      payload = await apiClient.get<unknown>(SALARY_AUDITS_PATH)
    } catch (error) {
      throw new Error(
        describeApiError(error, { 404: 'Salary audits are not available on the Paywise API yet.' }),
        { cause: error },
      )
    }
    return parseOrThrow(railsEmploymentHistoryListSchema, payload, 'salary audits').map(toSalaryAudit)
  },
}
