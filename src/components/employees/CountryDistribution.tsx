import type { CountryCount } from '@/types/employee'
import { formatNumber } from '@/utils/format'

/** Horizontal bar chart of headcount per country, built with plain HTML so no chart library is needed. */
export function CountryDistribution({ data, total }: { data: CountryCount[]; total: number }) {
  const largestCount = Math.max(1, ...data.map((item) => item.count))

  return (
    <ul className="space-y-3" aria-label="Employees by country">
      {data.map((item) => {
        const share = total === 0 ? 0 : Math.round((item.count / total) * 100)
        return (
          <li key={item.country}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-slate-700">{item.country}</span>
              <span className="text-slate-500 tabular-nums">
                <span className="font-medium text-slate-900">{formatNumber(item.count)}</span> · {share}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="h-2 rounded-full bg-brand-600"
                style={{ width: `${(item.count / largestCount) * 100}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
