export function formatShortDate(value: Date | string | null): string {
  if (!value) return 'No due date'
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeDate(value: Date | string | null): string {
  if (!value) return 'No due date'
  const date = typeof value === 'string' ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const day = 24 * 60 * 60 * 1000
  if (abs < day) return diffMs >= 0 ? 'today' : 'today'
  const days = Math.round(abs / day)
  return diffMs >= 0 ? `in ${days}d` : `${days}d ago`
}
