import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Employee, EmployeeFilters, EmployeeInput, EmployeeSortKey } from '@/types/employee'
import type { ListParams } from '@/types/list'
import { useClientSidePage } from '@/hooks/useClientSidePage'
import type { ListQueryRules } from '@/utils/listQuery'
import { employeeApi } from './employeeApi'
import { buildEmployeeSummary, distinctValues } from './employeeSummary'

/**
 * Query keys identify cached data in TanStack Query. Keeping them in one
 * object avoids typos and makes cache invalidation easy to find.
 */
export const employeeKeys = {
  all: ['employees'] as const,
  fullList: ['employees', 'full-list'] as const,
}

/**
 * Every employee from Rails, fetched once and shared by all screens (including
 * Salaries, which looks up names here). TanStack Query de-duplicates the
 * request and caches the result.
 */
export const allEmployeesQuery = queryOptions({
  queryKey: employeeKeys.fullList,
  queryFn: () => employeeApi.listAll(),
  // The full list is large; keep it for 5 minutes before refetching in the background.
  staleTime: 5 * 60 * 1000,
})

function useAllEmployees<TSelected = Employee[]>(select?: (employees: Employee[]) => TSelected) {
  return useQuery({ ...allEmployeesQuery, select })
}

const employeeListRules: ListQueryRules<Employee, EmployeeSortKey, EmployeeFilters> = {
  searchableText: (employee) => [employee.name, employee.email],
  matchesFilters: (employee, filters) =>
    (filters.designation === '' || employee.designation === filters.designation) &&
    (filters.country === '' || employee.country === filters.country),
  sortValue: (employee, key) => employee[key],
  id: (employee) => employee.id,
}

/** One page of employees, searched/filtered/sorted in the browser for now. */
export function useEmployeeList(params: ListParams<EmployeeSortKey, EmployeeFilters>) {
  return useClientSidePage(useAllEmployees(), params, employeeListRules)
}

/** Designation and country choices, taken from the real data. */
export function useEmployeeOptions() {
  const { data } = useAllEmployees((employees) => ({
    designations: distinctValues(employees, (employee) => employee.designation),
    countries: distinctValues(employees, (employee) => employee.country),
  }))
  return data ?? { designations: [], countries: [] }
}

/** A single employee, or `null` if the id doesn't exist. */
export function useEmployee(id: string) {
  return useAllEmployees((employees) => employees.find((employee) => employee.id === id) ?? null)
}

export function useEmployeeSummary() {
  return useAllEmployees((employees) => buildEmployeeSummary(employees))
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => employeeApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => employeeApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  })
}
