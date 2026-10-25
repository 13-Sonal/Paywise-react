import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { distinctValues } from '@/features/employees/employeeSummary'
import { allEmployeesQuery } from '@/features/employees/useEmployees'
import { useClientSidePage } from '@/hooks/useClientSidePage'
import type { ListParams } from '@/types/list'
import type {
  SalaryAudit,
  SalaryAuditFilters,
  SalaryAuditSortKey,
  SalaryFilters,
  SalaryRecord,
  SalarySortKey,
  SalaryUpdate,
} from '@/types/salary'
import type { ListQueryRules } from '@/utils/listQuery'
import { salaryApi } from './salaryApi'

export const salaryKeys = {
  all: ['salaries'] as const,
  fullList: ['salaries', 'full-list'] as const,
  audits: ['salaries', 'audits'] as const,
}

const FIVE_MINUTES = 5 * 60 * 1000

/**
 * The salary endpoints only send `user_id`, so names (and, for salaries, the
 * country) come from the cached users list. `ensureQueryData` reuses it if the
 * Employees tab already loaded it. TODO(rails): include `user: { name,
 * country_code }` in the responses and drop this lookup.
 */
async function fetchEmployeesById(queryClient: QueryClient) {
  const employees = await queryClient.ensureQueryData(allEmployeesQuery)
  return new Map(employees.map((employee) => [employee.id, employee]))
}

// ---------- Current salaries ----------

function useAllSalaries<TSelected = SalaryRecord[]>(select?: (records: SalaryRecord[]) => TSelected) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: salaryKeys.fullList,
    queryFn: async () => {
      const [records, employeesById] = await Promise.all([salaryApi.listAll(), fetchEmployeesById(queryClient)])
      return records.map((record) => {
        const employee = employeesById.get(record.employeeId)
        return employee ? { ...record, employeeName: employee.name, country: employee.country } : record
      })
    },
    staleTime: FIVE_MINUTES,
    select,
  })
}

const salaryListRules: ListQueryRules<SalaryRecord, SalarySortKey, SalaryFilters> = {
  searchableText: (record) => [record.employeeName],
  matchesFilters: (record, filters) =>
    (filters.designation === '' || record.designation === filters.designation) &&
    (filters.country === '' || record.country === filters.country),
  sortValue: (record, key) => record[key],
  id: (record) => record.id,
}

/** One page of current salaries, searched/filtered/sorted in the browser for now. */
export function useSalaryList(params: ListParams<SalarySortKey, SalaryFilters>) {
  return useClientSidePage(useAllSalaries(), params, salaryListRules)
}

/** Designation and country choices, taken from the real data. */
export function useSalaryFilterOptions() {
  const { data } = useAllSalaries((records) => ({
    designations: distinctValues(records, (record) => record.designation),
    countries: distinctValues(records, (record) => record.country),
  }))
  return data ?? { designations: [], countries: [] }
}

export function useUpdateSalary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: SalaryUpdate }) => salaryApi.update(id, update),
    // Refetch both lists: Rails may move the previous salary into the audits.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.all }),
  })
}

// ---------- Salary audits (past salaries) ----------

function useAllSalaryAudits<TSelected = SalaryAudit[]>(select?: (audits: SalaryAudit[]) => TSelected) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: salaryKeys.audits,
    queryFn: async () => {
      const [audits, employeesById] = await Promise.all([salaryApi.listAudits(), fetchEmployeesById(queryClient)])
      return audits.map((audit) => {
        const employee = employeesById.get(audit.employeeId)
        return employee ? { ...audit, employeeName: employee.name } : audit
      })
    },
    staleTime: FIVE_MINUTES,
    select,
  })
}

const salaryAuditListRules: ListQueryRules<SalaryAudit, SalaryAuditSortKey, SalaryAuditFilters> = {
  searchableText: (audit) => [audit.employeeName, audit.companyName],
  matchesFilters: (audit, filters) => filters.designation === '' || audit.designation === filters.designation,
  sortValue: (audit, key) => audit[key],
  id: (audit) => audit.id,
}

export function useSalaryAuditList(params: ListParams<SalaryAuditSortKey, SalaryAuditFilters>) {
  return useClientSidePage(useAllSalaryAudits(), params, salaryAuditListRules)
}

export function useSalaryAuditDesignations() {
  const { data } = useAllSalaryAudits((audits) => distinctValues(audits, (audit) => audit.designation))
  return data ?? []
}
