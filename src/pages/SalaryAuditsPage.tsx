import { LockKeyhole } from 'lucide-react'
import { canViewSalaries } from '@/features/authentication/permissions'
import { RequireRole } from '@/features/authentication/RequireRole'
import { useSalaryAuditDesignations, useSalaryAuditList } from '@/features/salaries/useSalaries'
import { useListState } from '@/hooks/useListState'
import type { SalaryAuditFilters, SalaryAuditSortKey } from '@/types/salary'
import { PageHeader } from '@/components/layout/PageHeader'
import { SalaryAuditTable } from '@/components/salaries/SalaryAuditTable'
import { Card } from '@/components/ui/Card'
import { ListToolbar } from '@/components/ui/ListToolbar'
import { Pagination } from '@/components/ui/Pagination'

/** Every past salary (Rails `employment_histories`). Same access rules as Salaries. */
export function SalaryAuditsPage() {
  return (
    <>
      <PageHeader
        title="Salary audits"
        description="Every past salary, newest first."
        breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Salary audits' }]}
      />
      <RequireRole isAllowed={canViewSalaries}>
        <p className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Confidential. Amounts are shown in the currency they were paid in.
        </p>
        <SalaryAuditList />
      </RequireRole>
    </>
  )
}

function SalaryAuditList() {
  const list = useListState<SalaryAuditSortKey, SalaryAuditFilters>({
    initialSort: { key: 'startedOn', direction: 'desc' },
    initialFilters: { designation: '' },
  })
  const { data, isPending, isFetching, isError, error, refetch } = useSalaryAuditList(list.params)
  const designations = useSalaryAuditDesignations()

  return (
    <Card>
      <ListToolbar
        searchLabel="Search salary audits"
        searchPlaceholder="Search by employee or company"
        searchValue={list.search}
        onSearchChange={list.setSearch}
        filters={[
          {
            id: 'designation',
            label: 'Filter salary audits by designation',
            allLabel: 'All designations',
            options: designations,
            value: list.filters.designation,
            onChange: (value) => list.setFilter('designation', value),
          },
        ]}
        hasActiveCriteria={list.hasActiveCriteria}
        onClear={list.clearSearchAndFilters}
      />
      <SalaryAuditTable
        audits={data?.items}
        sort={list.sort}
        onSortChange={list.toggleSort}
        isLoading={isPending}
        isRefreshing={isFetching && !isPending}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
      />
      {data && data.totalCount > 0 && !isError && (
        <Pagination
          label="Salary audits pagination"
          page={data.page}
          perPage={data.perPage}
          totalCount={data.totalCount}
          totalPages={data.totalPages}
          onPageChange={list.setPage}
          onPerPageChange={list.setPerPage}
        />
      )}
    </Card>
  )
}
