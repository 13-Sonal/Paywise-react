import { useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { canEditSalaries, canViewSalaries } from '@/features/authentication/permissions'
import { RequireRole } from '@/features/authentication/RequireRole'
import { useCurrentUser } from '@/features/authentication/useCurrentUser'
import { useSalaryFilterOptions, useSalaryList } from '@/features/salaries/useSalaries'
import { useListState } from '@/hooks/useListState'
import type { SalaryFilters, SalaryRecord, SalarySortKey } from '@/types/salary'
import { PageHeader } from '@/components/layout/PageHeader'
import { EditSalaryDialog } from '@/components/salaries/EditSalaryDialog'
import { SalaryTable } from '@/components/salaries/SalaryTable'
import { Card, CardHeader } from '@/components/ui/Card'
import { ListToolbar } from '@/components/ui/ListToolbar'
import { Pagination } from '@/components/ui/Pagination'

export function SalariesPage() {
  return (
    <>
      <PageHeader
        title="Salaries"
        description="Current compensation for each employee."
        breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Salaries' }]}
      />
      {/* Hide the screen from roles that shouldn't see pay. Rails must enforce the same rule on the API. */}
      <RequireRole isAllowed={canViewSalaries}>
        <p className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Confidential. Amounts are annual and shown in each employee's local currency.
        </p>
        <CurrentSalaries />
      </RequireRole>
    </>
  )
}

function CurrentSalaries() {
  const { data: currentUser } = useCurrentUser()
  const [recordBeingEdited, setRecordBeingEdited] = useState<SalaryRecord | null>(null)
  const list = useListState<SalarySortKey, SalaryFilters>({
    initialSort: { key: 'employeeName', direction: 'asc' },
    initialFilters: { designation: '', country: '' },
  })
  const { data, isPending, isFetching, isError, error, refetch } = useSalaryList(list.params)
  const options = useSalaryFilterOptions()

  return (
    <Card>
      <CardHeader title="Current salaries" />
      <ListToolbar
        searchLabel="Search salaries by employee"
        searchPlaceholder="Search by employee name"
        searchValue={list.search}
        onSearchChange={list.setSearch}
        filters={[
          {
            id: 'designation',
            label: 'Filter by designation',
            allLabel: 'All designations',
            options: options.designations,
            value: list.filters.designation,
            onChange: (value) => list.setFilter('designation', value),
          },
          {
            id: 'country',
            label: 'Filter by country',
            allLabel: 'All countries',
            options: options.countries,
            value: list.filters.country,
            onChange: (value) => list.setFilter('country', value),
          },
        ]}
        hasActiveCriteria={list.hasActiveCriteria}
        onClear={list.clearSearchAndFilters}
      />
      <SalaryTable
        records={data?.items}
        sort={list.sort}
        onSortChange={list.toggleSort}
        onEditSalary={canEditSalaries(currentUser) ? setRecordBeingEdited : undefined}
        isLoading={isPending}
        isRefreshing={isFetching && !isPending}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
      />
      {data && data.totalCount > 0 && !isError && (
        <Pagination
          label="Current salaries pagination"
          page={data.page}
          perPage={data.perPage}
          totalCount={data.totalCount}
          totalPages={data.totalPages}
          onPageChange={list.setPage}
          onPerPageChange={list.setPerPage}
        />
      )}
      {recordBeingEdited && (
        <EditSalaryDialog record={recordBeingEdited} onClose={() => setRecordBeingEdited(null)} />
      )}
    </Card>
  )
}
