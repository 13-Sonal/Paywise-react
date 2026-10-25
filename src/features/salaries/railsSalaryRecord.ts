import { z } from 'zod'
import { countryNameFromCode } from '@/features/employees/railsUser'
import type { SalaryRecord } from '@/types/salary'

/**
 * Shape of one record in `GET /api/v1/salaries` (Rails `as_json`, snake_case).
 * Unknown keys are dropped. `compensation` is a Postgres decimal, which Rails
 * serialises as a string ("85000.0"), so both strings and numbers are accepted.
 */
const railsSalaryRecordSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  user_id: z.union([z.number(), z.string()]).transform(String),
  compensation: z.union([z.number(), z.string()]).transform(Number),
  currency: z.string().nullable(),
  effective_from: z.string().nullable(),
  role: z.object({ name: z.string() }).nullable().optional(),
  // Present once Rails includes it: `include: { user: { only: [:id, :name, :country_code] } }`.
  user: z.object({ name: z.string(), country_code: z.string().nullable() }).nullable().optional(),
})

type RailsSalaryRecord = z.infer<typeof railsSalaryRecordSchema>

export const railsSalaryRecordListSchema = z.array(railsSalaryRecordSchema)

/** Converts a Rails salary record into the frontend `SalaryRecord` type. */
export function toSalaryRecord(record: RailsSalaryRecord): SalaryRecord {
  return {
    id: record.id,
    employeeId: record.user_id,
    employeeName: record.user?.name ?? `User #${record.user_id}`,
    designation: record.role?.name ?? 'Unassigned',
    country: record.user ? countryNameFromCode(record.user.country_code) : 'Unknown',
    compensation: record.compensation,
    currency: record.currency ?? '',
    effectiveDate: record.effective_from ?? '',
  }
}
