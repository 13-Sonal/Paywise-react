import { Link } from 'react-router'
import { Eye, Pencil, UserPlus, Users } from 'lucide-react'
import type { Employee, EmployeeSortKey } from '@/types/employee'
import type { SortState } from '@/types/list'
import { formatDate } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'

/**
 * Columns for the employee list. Only non-sensitive fields appear here —
 * contact details and blood group are on the details page.
 */
const columns: DataTableColumn<Employee, EmployeeSortKey>[] = [
  {
    id: 'name',
    header: 'Employee',
    sortKey: 'name',
    render: (employee) => (
      <Link to={`/employees/${employee.id}`} className="group flex items-center gap-3">
        <Avatar name={employee.name} />
        <span className="font-medium text-slate-900 group-hover:text-brand-700 group-hover:underline">
          {employee.name}
        </span>
      </Link>
    ),
  },
  { id: 'email', header: 'Email', sortKey: 'email', render: (employee) => employee.email },
  {
    id: 'designation',
    header: 'Designation',
    sortKey: 'designation',
    render: (employee) => <Badge tone="brand">{employee.designation}</Badge>,
  },
  { id: 'country', header: 'Country', sortKey: 'country', render: (employee) => employee.country },
  { id: 'hireDate', header: 'Hire date', sortKey: 'hireDate', render: (employee) => formatDate(employee.hireDate) },
  {
    id: 'actions',
    header: 'Actions',
    hideHeader: true,
    className: 'text-right',
    render: (employee) => (
      <div className="flex justify-end gap-1">
        <Link
          to={`/employees/${employee.id}`}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label={`View ${employee.name}`}
          title="View"
        >
          <Eye className="size-4" aria-hidden="true" />
        </Link>
        <Link
          to={`/employees/${employee.id}/edit`}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label={`Edit ${employee.name}`}
          title="Edit"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Link>
      </div>
    ),
  },
]

interface EmployeeTableProps {
  employees: Employee[] | undefined
  sort: SortState<EmployeeSortKey>
  onSortChange: (key: EmployeeSortKey) => void
  isLoading: boolean
  isRefreshing: boolean
  isError: boolean
  onRetry: () => void
  hasActiveCriteria: boolean
  onClearCriteria: () => void
}

export function EmployeeTable({ hasActiveCriteria, onClearCriteria, employees, ...tableProps }: EmployeeTableProps) {
  const emptyState = hasActiveCriteria ? (
    <EmptyState
      icon={Users}
      title="No employees match your search"
      description="Try a different name or email, or clear the filters."
      action={
        <button
          type="button"
          onClick={onClearCriteria}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Clear search and filters
        </button>
      }
    />
  ) : (
    <EmptyState
      icon={Users}
      title="No employees yet"
      description="Add your first employee to start managing your team."
      action={
        <ButtonLink to="/employees/new" size="sm">
          <UserPlus className="size-4" aria-hidden="true" />
          Add employee
        </ButtonLink>
      }
    />
  )

  return (
    <DataTable
      caption="Employees"
      columns={columns}
      rows={employees}
      getRowId={(employee) => employee.id}
      emptyState={emptyState}
      {...tableProps}
    />
  )
}
