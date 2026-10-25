import { useMemo, useState } from 'react'
import type { ListParams, SortState } from '@/types/list'
import { useDebouncedValue } from './useDebouncedValue'

interface UseListStateOptions<TSortKey extends string, TFilters> {
  initialSort: SortState<TSortKey>
  initialFilters: TFilters
  initialPerPage?: number
}

/**
 * Holds the search text, filters, sort order and page for a paginated list,
 * and builds the `ListParams` to send to the data layer.
 *
 * Any change to search, filters, sort or page size jumps back to page 1 so
 * the user never lands on a page that no longer exists.
 */
export function useListState<TSortKey extends string, TFilters extends Record<string, string>>({
  initialSort,
  initialFilters,
  initialPerPage = 10,
}: UseListStateOptions<TSortKey, TFilters>) {
  const [search, setSearchText] = useState('')
  const [filters, setFilters] = useState<TFilters>(initialFilters)
  const [sort, setSort] = useState<SortState<TSortKey>>(initialSort)
  const [page, setPage] = useState(1)
  const [perPage, setPerPageValue] = useState(initialPerPage)

  const debouncedSearch = useDebouncedValue(search)

  function setSearch(value: string) {
    setSearchText(value)
    setPage(1)
  }

  function setFilter(name: keyof TFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  /** Clicking the active column flips direction; clicking another column sorts it ascending. */
  function toggleSort(key: TSortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
    setPage(1)
  }

  function setPerPage(value: number) {
    setPerPageValue(value)
    setPage(1)
  }

  function clearSearchAndFilters() {
    setSearchText('')
    setFilters(initialFilters)
    setPage(1)
  }

  // Memoised so the object only changes when a value changes (it's used as a cache key and memo dependency).
  const params = useMemo<ListParams<TSortKey, TFilters>>(
    () => ({ search: debouncedSearch, filters, sort, page, perPage }),
    [debouncedSearch, filters, sort, page, perPage],
  )
  const hasActiveCriteria = search !== '' || Object.values(filters).some((value) => value !== '')

  return {
    params,
    search,
    setSearch,
    filters,
    setFilter,
    sort,
    toggleSort,
    setPage,
    setPerPage,
    clearSearchAndFilters,
    hasActiveCriteria,
  }
}
