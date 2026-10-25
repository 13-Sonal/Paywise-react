export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
export type BloodGroup = (typeof BLOOD_GROUPS)[number]

export interface Employee {
  /** Stable unique identifier. A string so it works for numeric or UUID ids from Rails. */
  id: string
  name: string
  email: string
  designation: string
  country: string
  /** ISO date, `YYYY-MM-DD`. */
  hireDate: string
  primaryContactNumber: string
  emergencyContactNumber: string | null
  address: string | null
  bloodGroup: BloodGroup | null
}

/** The attributes a user can create or edit (everything except the id). */
export type EmployeeInput = Omit<Employee, 'id'>

/** Columns the employee table can be sorted by. */
export type EmployeeSortKey = 'name' | 'email' | 'designation' | 'country' | 'hireDate'

// A `type` (not `interface`) so it fits the `Record<string, string>` constraint in useListState.
export type EmployeeFilters = {
  designation: string
  country: string
}

export interface CountryCount {
  country: string
  count: number
}

export interface EmployeeSummary {
  totalEmployees: number
  hiredThisMonth: number
  countryCount: number
  designationCount: number
  employeesByCountry: CountryCount[]
  recentHires: Employee[]
}
