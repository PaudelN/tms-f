export function isDueToday(value: Date | null): boolean {
  if (!value) return false
  const now = new Date()
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth() && value.getDate() === now.getDate()
}

export function isOverdue(value: Date | null): boolean {
  if (!value) return false
  return value.getTime() < Date.now()
}

export function isUpcoming(value: Date | null): boolean {
  if (!value) return false
  return value.getTime() > Date.now()
}
