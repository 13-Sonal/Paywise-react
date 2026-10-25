import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { SortState } from '@/types/list'
import { cn } from '@/utils/cn'
import { ErrorState } from './ErrorState'

export interface DataTableColumn<TItem, TSortKey extends string> {
  id: string
  header: string
  /** Set to make the column sortable. */
  sortKey?: TSortKey
  render: (item: TItem) => ReactNode
  /** Extra classes for both the header and the cells, e.g. alignment. */
  className?: string
  /** Visually hide the header text (still read by screen readers). */
  hideHeader?: boolean
}

interface DataTableProps<TItem, TSortKey extends string> {
  /** Describes the table for screen-reader users. */
  caption: string
  columns: DataTableColumn<TItem, TSortKey>[]
  rows: TItem[] | undefined
  /** Must return a stable, unique id — used as the React `key`. */
  getRowId: (item: TItem) => string
  sort: SortState<TSortKey>
  onSortChange: (key: TSortKey) => void
  isLoading: boolean
  /** True while a newer page is loading and old rows are still shown. */
  isRefreshing?: boolean
  isError: boolean
  /** Shown instead of the generic error text, e.g. the message from the API. */
  errorMessage?: string
  onRetry: () => void
  emptyState: ReactNode
  skeletonRowCount?: number
}

/**
 * Generic table used by the employee and salary lists. It only renders what
 * it's given — searching, sorting and paging happen in the data layer.
 */
export function DataTable<TItem, TSortKey extends string>({
  caption,
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  isLoading,
  isRefreshing = false,
  isError,
  errorMessage,
  onRetry,
  emptyState,
  skeletonRowCount = 6,
}: DataTableProps<TItem, TSortKey>) {
  if (isError) return <ErrorState message={errorMessage} onRetry={onRetry} />
  if (!isLoading && rows?.length === 0) return emptyState

  return (
    // `relative` keeps visually hidden (absolutely positioned) header text inside the scroll area.
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm" aria-busy={isLoading || isRefreshing}>
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50/80 text-xs font-medium tracking-wide text-slate-500 uppercase">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn('px-4 py-2.5 whitespace-nowrap', column.className)}
                aria-sort={
                  column.sortKey && sort.key === column.sortKey
                    ? sort.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {column.sortKey ? (
                  <SortButton
                    label={column.header}
                    direction={sort.key === column.sortKey ? sort.direction : null}
                    onClick={() => onSortChange(column.sortKey as TSortKey)}
                  />
                ) : (
                  <span className={cn(column.hideHeader && 'sr-only')}>{column.header}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={cn('divide-y divide-slate-100', isRefreshing && 'opacity-60 transition-opacity')}>
          {isLoading
            ? Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-3.5">
                      <span className="block h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            : rows?.map((item) => (
                <tr key={getRowId(item)} className="hover:bg-slate-50/70">
                  {columns.map((column) => (
                    <td key={column.id} className={cn('px-4 py-3 whitespace-nowrap text-slate-700', column.className)}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {isLoading && (
        <span role="status" className="sr-only">
          Loading
        </span>
      )}
    </div>
  )
}

function SortButton({
  label,
  direction,
  onClick,
}: {
  label: string
  direction: 'asc' | 'desc' | null
  onClick: () => void
}) {
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ChevronsUpDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded uppercase hover:text-slate-900',
        direction && 'text-slate-900',
      )}
    >
      {label}
      <Icon className={cn('size-3.5', !direction && 'text-slate-400')} aria-hidden="true" />
    </button>
  )
}
