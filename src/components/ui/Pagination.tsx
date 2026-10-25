import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatNumber } from '@/utils/format'
import { Button } from './Button'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

interface PaginationProps {
  /** Accessible name; must be unique when a page has several tables. */
  label?: string
  page: number
  perPage: number
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function Pagination({ label = 'Pagination', page, perPage, totalCount, totalPages, onPageChange, onPerPageChange }: PaginationProps) {
  const firstRow = totalCount === 0 ? 0 : (page - 1) * perPage + 1
  const lastRow = Math.min(page * perPage, totalCount)

  return (
    <nav
      aria-label={label}
      className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600" aria-live="polite">
        Showing <span className="font-medium text-slate-900">{formatNumber(firstRow)}</span>–
        <span className="font-medium text-slate-900">{formatNumber(lastRow)}</span> of{' '}
        <span className="font-medium text-slate-900">{formatNumber(totalCount)}</span>
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Rows per page
          <select
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-2"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="min-w-20 text-center text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-2"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
