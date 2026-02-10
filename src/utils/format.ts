export function relativeDate(date: Date | null): string {
  if (!date) return 'No date'
  const ms = date.getTime() - Date.now()
  const days = Math.round(ms / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days === -1) return 'yesterday'
  if (days > 1) return `in ${days} days`
  return `${Math.abs(days)} days ago`
}
