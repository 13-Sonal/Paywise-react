import { useMemo } from 'react'
import { Banknote, Pencil } from 'lucide-react'
import type { SortState } from '@/types/list'
import type { SalaryRecord, SalarySortKey } from '@/types/salary'
import { formatCurrency, formatDate } from '@/utils/format'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'

/**
 * Compensation is not sortable: amounts are in different currencies, so
 * ordering them without exchange rates would be misleading.
 */
const baseColumns: DataTableColumn<SalaryRecord, SalarySortKey>[] = [
  {
    id: 'employeeName',
    header: 'Employee',
    sortKey: 'employeeName',
    render: (record) => <span className="font-medium text-slate-900">{record.employeeName}</span>,
  },
  { id: 'designation', header: 'Designation', sortKey: 'designation', render: (record) => record.designation },
  { id: 'country', header: 'Country', sortKey: 'country', render: (record) => record.country },
  {
    id: 'compensation',
    header: 'Compensation',
    className: 'text-right tabular-nums',
    render: (record) => (
      <span className="font-medium text-slate-900">{formatCurrency(record.compensation, record.currency)}</span>
    ),
  },
  { id: 'currency', header: 'Currency', render: (record) => record.currency },
  {
    id: 'effectiveDate',
    header: 'Effective date',
    sortKey: 'effectiveDate',
    render: (record) => formatDate(record.effectiveDate),
  },
]

interface SalaryTableProps {
  records: SalaryRecord[] | undefined
  /** Pass to show an "Edit" action on each row (only for roles allowed to edit). */
  onEditSalary?: (record: SalaryRecord) => void
  sort: SortState<SalarySortKey>
  onSortChange: (key: SalarySortKey) => void
  isLoading: boolean
  isRefreshing: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
}

export function SalaryTable({ records, onEditSalary, ...tableProps }: SalaryTableProps) {
  const columns = useMemo(
    () =>
      onEditSalary
        ? [
            ...baseColumns,
            {
              id: 'actions',
              header: 'Actions',
              hideHeader: true,
              className: 'text-right',
              render: (record: SalaryRecord) => (
                <button
                  type="button"
                  onClick={() => onEditSalary(record)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label={`Update salary for ${record.employeeName}`}
                  title="Update salary"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </button>
              ),
            },
          ]
        : baseColumns,
    [onEditSalary],
  )

  return (
    <DataTable
      caption="Employee compensation"
      columns={columns}
      rows={records}
      getRowId={(record) => record.id}
      emptyState={
        <EmptyState
          icon={Banknote}
          title="No compensation records found"
          description="Try a different search or clear the filters."
        />
      }
      {...tableProps}
    />
  )
}
