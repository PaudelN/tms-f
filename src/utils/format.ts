export function formatRelativeDate(value: string | null): string {
  if (!value) return '-'
  const target = new Date(value)
  const diffMs = target.getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  return `In ${diffDays}d`
}
