/** Joins CSS class names, skipping falsy values: `cn('a', isActive && 'b')`. */
export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ')
}
