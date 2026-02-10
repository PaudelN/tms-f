export function formatShortDate(value: Date | null): string {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(value)
}

export function formatRelativeDate(value: Date | null): string {
  if (!value) return 'No due date'
  const diffHours = Math.round((value.getTime() - Date.now()) / 3600000)
  if (Math.abs(diffHours) < 24) return `${diffHours >= 0 ? 'in' : ''} ${Math.abs(diffHours)}h${diffHours < 0 ? ' ago' : ''}`.trim()
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays >= 0 ? 'in' : ''} ${Math.abs(diffDays)}d${diffDays < 0 ? ' ago' : ''}`.trim()
}
