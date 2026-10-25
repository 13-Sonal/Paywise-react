const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Formats an ISO `YYYY-MM-DD` date as e.g. "Oct 25, 2026". Dates are treated as calendar dates (UTC). */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? isoDate : dateFormatter.format(date)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/** Formats an amount with its ISO currency code. Falls back to "85,000 XYZ" if the code isn't valid. */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${formatNumber(amount)} ${currency}`.trim()
  }
}

/** "Priya Sharma" → "PS" */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
