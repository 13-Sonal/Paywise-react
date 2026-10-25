import { useMemo } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ListParams } from '@/types/list'
import { applyListQuery, type ListQueryRules } from '@/utils/listQuery'

/**
 * Turns a query that returns a whole list into one page of results, searched,
 * filtered and sorted in the browser.
 *
 * Used while the Rails endpoints return everything at once. Define `rules` at
 * module level (not inline) so it doesn't change on every render.
 */
export function useClientSidePage<TItem, TSortKey extends string, TFilters>(
  query: UseQueryResult<TItem[]>,
  params: ListParams<TSortKey, TFilters>,
  rules: ListQueryRules<TItem, TSortKey, TFilters>,
) {
  const page = useMemo(
    () => (query.data ? applyListQuery(query.data, params, rules) : undefined),
    [query.data, params, rules],
  )
  return { ...query, data: page }
}
