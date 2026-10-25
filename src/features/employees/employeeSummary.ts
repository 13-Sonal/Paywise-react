import type { Employee, EmployeeSummary } from '@/types/employee'

/** Dashboard numbers, computed from the full employee list. */
export function buildEmployeeSummary(employees: Employee[], today = new Date()): EmployeeSummary {
  const currentMonthPrefix = today.toISOString().slice(0, 7) // "YYYY-MM"
  const countsByCountry = new Map<string, number>()
  for (const employee of employees) {
    countsByCountry.set(employee.country, (countsByCountry.get(employee.country) ?? 0) + 1)
  }

  return {
    totalEmployees: employees.length,
    hiredThisMonth: employees.filter((employee) => employee.hireDate.startsWith(currentMonthPrefix)).length,
    countryCount: countsByCountry.size,
    designationCount: new Set(employees.map((employee) => employee.designation)).size,
    employeesByCountry: [...countsByCountry]
      .map(([country, count]) => ({ country, count }))
      .sort((first, second) => second.count - first.count),
    recentHires: [...employees].sort((first, second) => second.hireDate.localeCompare(first.hireDate)).slice(0, 6),
  }
}

/** Sorted, de-duplicated values for filter dropdowns. */
export function distinctValues<TItem>(items: TItem[], pick: (item: TItem) => string): string[] {
  return [...new Set(items.map(pick))].sort((first, second) => first.localeCompare(second))
}
