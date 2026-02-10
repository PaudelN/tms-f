export function dueLabel(date: Date | null): string {
  if (!date) return 'No due date'
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const tomorrow = new Date(start); tomorrow.setDate(tomorrow.getDate() + 1)
  const target = new Date(date); target.setHours(0, 0, 0, 0)
  if (target.getTime() === start.getTime()) return 'Today'
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow'
  if (target < start) return 'Overdue'
  return 'Upcoming'
}
