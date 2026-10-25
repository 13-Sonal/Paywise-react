import type { ListParams, PaginatedResult } from '@/types/list'

// `numeric: true` sorts "emp_2" before "emp_10" and is much faster than localeCompare on large lists.
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export interface ListQueryRules<TItem, TSortKey extends string, TFilters> {
  /** Text the search box should match against. */
  searchableText: (item: TItem) => string[]
  matchesFilters: (item: TItem, filters: TFilters) => boolean
  sortValue: (item: TItem, key: TSortKey) => string
  id: (item: TItem) => string
}

/**
 * Applies search → filters → sorting → pagination to an in-memory array.
 *
 * Used while the Rails API returns whole lists without pagination. Once
 * Rails supports `page`/`per_page`/search params, this moves to the server and
 * the UI keeps sending the same `ListParams` and receiving the same
 * `PaginatedResult`.
 */
export function applyListQuery<TItem, TSortKey extends string, TFilters>(
  allItems: TItem[],
  params: ListParams<TSortKey, TFilters>,
  rules: ListQueryRules<TItem, TSortKey, TFilters>,
): PaginatedResult<TItem> {
  const searchTerm = params.search.trim().toLowerCase()

  const matchingItems = allItems.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      rules.searchableText(item).some((text) => text.toLowerCase().includes(searchTerm))
    return matchesSearch && rules.matchesFilters(item, params.filters)
  })

  const directionMultiplier = params.sort.direction === 'asc' ? 1 : -1
  const sortedItems = [...matchingItems].sort((first, second) => {
    const comparison = collator.compare(rules.sortValue(first, params.sort.key), rules.sortValue(second, params.sort.key))
    // Fall back to the id so rows with equal values keep a stable order between pages.
    return (comparison || collator.compare(rules.id(first), rules.id(second))) * directionMultiplier
  })

  const totalCount = sortedItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / params.perPage))
  const page = Math.min(Math.max(1, params.page), totalPages)
  const startIndex = (page - 1) * params.perPage

  return {
    items: sortedItems.slice(startIndex, startIndex + params.perPage),
    totalCount,
    page,
    perPage: params.perPage,
    totalPages,
  }
}
