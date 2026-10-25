import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/format'

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

/** Initials avatar. Decorative — the person's name is always shown next to it. */
export function Avatar({ name, size = 'sm' }: { name: string; size?: keyof typeof sizeClasses }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-800',
        sizeClasses[size],
      )}
    >
      {getInitials(name)}
    </span>
  )
}
