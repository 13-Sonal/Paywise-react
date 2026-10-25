export type SortDirection = 'asc' | 'desc'

export interface SortState<TSortKey extends string> {
  key: TSortKey
  direction: SortDirection
}

/** Parameters every paginated list request sends. Mirrors what server-side pagination will need. */
export interface ListParams<TSortKey extends string, TFilters> {
  search: string
  filters: TFilters
  sort: SortState<TSortKey>
  page: number
  perPage: number
}

export interface PaginatedResult<TItem> {
  items: TItem[]
  totalCount: number
  page: number
  perPage: number
  totalPages: number
}
