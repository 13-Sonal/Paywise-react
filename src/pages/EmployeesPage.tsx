import { UserPlus } from 'lucide-react'
import { useEmployeeList, useEmployeeOptions } from '@/features/employees/useEmployees'
import { useListState } from '@/hooks/useListState'
import type { EmployeeFilters, EmployeeSortKey } from '@/types/employee'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ListToolbar } from '@/components/ui/ListToolbar'
import { Pagination } from '@/components/ui/Pagination'

export function EmployeesPage() {
  const list = useListState<EmployeeSortKey, EmployeeFilters>({
    initialSort: { key: 'name', direction: 'asc' },
    initialFilters: { designation: '', country: '' },
  })
  const { data, isPending, isFetching, isError, refetch } = useEmployeeList(list.params)
  const options = useEmployeeOptions()

  return (
    <>
      <PageHeader
        title="Employees"
        description="Search, filter and manage employee records."
        breadcrumbs={[{ label: 'Home', to: '/dashboard' }, { label: 'Employees' }]}
        actions={
          <ButtonLink to="/employees/new">
            <UserPlus className="size-4" aria-hidden="true" />
            Add Employee
          </ButtonLink>
        }
      />

      <Card>
        <ListToolbar
          searchLabel="Search employees"
          searchPlaceholder="Search by name or email"
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

        <EmployeeTable
          employees={data?.items}
          sort={list.sort}
          onSortChange={list.toggleSort}
          isLoading={isPending}
          isRefreshing={isFetching && !isPending}
          isError={isError}
          onRetry={() => void refetch()}
          hasActiveCriteria={list.hasActiveCriteria}
          onClearCriteria={list.clearSearchAndFilters}
        />

        {data && data.totalCount > 0 && !isError && (
          <Pagination
            page={data.page}
            perPage={data.perPage}
            totalCount={data.totalCount}
            totalPages={data.totalPages}
            onPageChange={list.setPage}
            onPerPageChange={list.setPerPage}
          />
        )}
      </Card>
    </>
  )
}
