import { cn } from '@/utils/cn'

/** Paywise logo: a "P" monogram plus the product name. */
export function BrandMark({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={tone === 'light' ? '#ffffff' : '#1e2a5a'} />
        <path
          d="M10 23V9h7a5 5 0 0 1 0 10h-7"
          fill="none"
          stroke={tone === 'light' ? '#1e2a5a' : '#2dd4bf'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn('text-lg font-semibold tracking-tight', tone === 'light' ? 'text-white' : 'text-brand-900')}
      >
        Paywise
      </span>
    </span>
  )
}
