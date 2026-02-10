export function formatTaskDate(date: Date | null): string {
  if (!date) return 'No due date'
  const today = new Date()
  const normalize = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const diff = normalize(date) - normalize(today)
  if (diff === 0) return 'Today'
  if (diff === 86_400_000) return 'Tomorrow'
  return date.toLocaleDateString()
}
