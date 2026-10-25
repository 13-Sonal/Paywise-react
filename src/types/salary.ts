/**
 * Compensation record for one employee. Sensitive: only render inside
 * authenticated, role-checked screens.
 */
export interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  country: string
  /** Annual compensation in major currency units (e.g. dollars, not cents). */
  compensation: number
  /** ISO 4217 currency code, e.g. `USD`. */
  currency: string
  /** ISO date, `YYYY-MM-DD`. */
  effectiveDate: string
}

export type SalarySortKey = 'employeeName' | 'designation' | 'country' | 'effectiveDate'

export type SalaryFilters = {
  designation: string
  country: string
}

/** The fields an HR Manager can change on a salary record. */
export interface SalaryUpdate {
  compensation: number
  currency: string
  /** ISO date, `YYYY-MM-DD`. */
  effectiveDate: string
}

/**
 * A past salary (Rails `employment_histories`). Shown in the "Salary audits"
 * section. Sensitive, like `SalaryRecord`.
 */
export interface SalaryAudit {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  companyName: string
  salary: number | null
  currency: string
  /** ISO dates, `YYYY-MM-DD`. `endedOn` is empty for an open-ended entry. */
  startedOn: string
  endedOn: string
}

export type SalaryAuditSortKey = 'employeeName' | 'designation' | 'companyName' | 'startedOn' | 'endedOn'

export type SalaryAuditFilters = {
  designation: string
}
