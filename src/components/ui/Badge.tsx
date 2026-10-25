import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeTone = 'neutral' | 'brand' | 'accent' | 'warning'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  accent: 'bg-accent-50 text-accent-700 ring-accent-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}
