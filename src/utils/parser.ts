import type { TaskPriority } from '@/types/models'

export interface ParsedTask {
  title: string
  dueDate?: Date
  priority?: TaskPriority
  tags: string[]
  assigneeEmail?: string
}

export function parseTaskInput(input: string): ParsedTask {
  let remaining = input.trim()
  const parsed: ParsedTask = { title: '', tags: [] }

  const priorityMatch = remaining.match(/@(low|medium|high|urgent)\b/i)
  if (priorityMatch) {
    parsed.priority = priorityMatch[1].toLowerCase() as TaskPriority
    remaining = remaining.replace(priorityMatch[0], '').trim()
  }

  const tagMatches = remaining.matchAll(/#(\w+)/g)
  for (const match of tagMatches) {
    parsed.tags.push(match[1])
    remaining = remaining.replace(match[0], '').trim()
  }

  const assigneeMatch = remaining.match(/@([\w.+-]+@[\w.-]+\.\w+)/i)
  if (assigneeMatch) {
    parsed.assigneeEmail = assigneeMatch[1]
    remaining = remaining.replace(assigneeMatch[0], '').trim()
  }

  const dateMatch = remaining.match(/\b(today|tomorrow|next week|in \d+ days?)\b/i)
  if (dateMatch) {
    parsed.dueDate = toDate(dateMatch[0])
    remaining = remaining.replace(dateMatch[0], '').replace(/\bdue\b/i, '').trim()

    const timeMatch = remaining.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (parsed.dueDate && timeMatch) {
      let hour = Number(timeMatch[1])
      const minute = Number(timeMatch[2] ?? 0)
      const meridiem = timeMatch[3]?.toLowerCase()
      if (meridiem === 'pm' && hour < 12) hour += 12
      if (meridiem === 'am' && hour === 12) hour = 0
      parsed.dueDate.setHours(hour, minute, 0, 0)
      remaining = remaining.replace(timeMatch[0], '').trim()
    }
  }

  parsed.title = remaining.trim()
  return parsed
}

function toDate(token: string): Date {
  const now = new Date()
  if (/today/i.test(token)) return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (/tomorrow/i.test(token)) return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  if (/next week/i.test(token)) return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
  const inDays = token.match(/in\s+(\d+)\s+days?/i)
  if (inDays) return new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(inDays[1]))
  return now
}
