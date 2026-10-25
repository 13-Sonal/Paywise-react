import { History } from 'lucide-react'
import type { SortState } from '@/types/list'
import type { SalaryAudit, SalaryAuditSortKey } from '@/types/salary'
import { formatCurrency, formatDate } from '@/utils/format'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'

const columns: DataTableColumn<SalaryAudit, SalaryAuditSortKey>[] = [
  {
    id: 'employeeName',
    header: 'Employee',
    sortKey: 'employeeName',
    render: (audit) => <span className="font-medium text-slate-900">{audit.employeeName}</span>,
  },
  { id: 'designation', header: 'Designation', sortKey: 'designation', render: (audit) => audit.designation },
  {
    id: 'salary',
    header: 'Salary',
    className: 'text-right tabular-nums',
    render: (audit) =>
      audit.salary === null ? (
        <span className="text-slate-400">—</span>
      ) : (
        <span className="font-medium text-slate-900">{formatCurrency(audit.salary, audit.currency)}</span>
      ),
  },
  { id: 'companyName', header: 'Company', sortKey: 'companyName', render: (audit) => audit.companyName },
  {
    id: 'startedOn',
    header: 'From',
    sortKey: 'startedOn',
    render: (audit) => (audit.startedOn ? formatDate(audit.startedOn) : '—'),
  },
  {
    id: 'endedOn',
    header: 'To',
    sortKey: 'endedOn',
    render: (audit) => (audit.endedOn ? formatDate(audit.endedOn) : <span className="text-slate-400">Present</span>),
  },
]

interface SalaryAuditTableProps {
  audits: SalaryAudit[] | undefined
  sort: SortState<SalaryAuditSortKey>
  onSortChange: (key: SalaryAuditSortKey) => void
  isLoading: boolean
  isRefreshing: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
}

export function SalaryAuditTable({ audits, ...tableProps }: SalaryAuditTableProps) {
  return (
    <DataTable
      caption="Salary audits"
      columns={columns}
      rows={audits}
      getRowId={(audit) => audit.id}
      emptyState={
        <EmptyState
          icon={History}
          title="No past salaries found"
          description="Try a different search or clear the filter."
        />
      }
      {...tableProps}
    />
  )
}
