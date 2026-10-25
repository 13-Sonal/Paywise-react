import { z } from 'zod'
import type { SalaryAudit } from '@/types/salary'

/**
 * Shape of one row from the salary audits endpoint — a Rails
 * `employment_histories` record (`as_json`, snake_case). Decimals arrive as
 * strings ("85000.0"). Unknown keys are dropped.
 */
const railsEmploymentHistorySchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  user_id: z.union([z.number(), z.string()]).transform(String),
  company_name: z.string().nullable(),
  designation: z.string().nullable(),
  salary: z.union([z.number(), z.string()]).nullable().transform((value) => (value === null ? null : Number(value))),
  currency: z.string().nullable(),
  started_on: z.string().nullable(),
  ended_on: z.string().nullable(),
})

type RailsEmploymentHistory = z.infer<typeof railsEmploymentHistorySchema>

export const railsEmploymentHistoryListSchema = z.array(railsEmploymentHistorySchema)

/** The employee name is filled in afterwards from the users list (see useSalaries.ts). */
export function toSalaryAudit(history: RailsEmploymentHistory): SalaryAudit {
  return {
    id: history.id,
    employeeId: history.user_id,
    employeeName: `User #${history.user_id}`,
    designation: history.designation ?? '—',
    companyName: history.company_name ?? '—',
    salary: history.salary,
    currency: history.currency ?? '',
    startedOn: history.started_on ?? '',
    endedOn: history.ended_on ?? '',
  }
}
