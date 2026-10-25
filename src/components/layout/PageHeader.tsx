import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export interface Breadcrumb {
  label: string
  /** Omit for the current page. */
  to?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs: Breadcrumb[]
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.label} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3 text-slate-400" aria-hidden="true" />}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-slate-900">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-slate-700">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </div>
  )
}
