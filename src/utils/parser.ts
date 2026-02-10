import type { TaskPriority } from '@/types'

export interface ParsedTaskInput {
  title: string
  priority?: TaskPriority
  dueDate?: string
  tags: string[]
}

export function parseTaskInput(input: string): ParsedTaskInput {
  let remainder = input.trim()
  const tags = [...remainder.matchAll(/#([a-z0-9-_]+)/gi)].map((match) => match[1])
  remainder = remainder.replace(/#([a-z0-9-_]+)/gi, '').trim()

  const priorityMatch = remainder.match(/@(low|medium|high|urgent)/i)
  const priority = priorityMatch?.[1]?.toLowerCase() as TaskPriority | undefined
  if (priorityMatch) {
    remainder = remainder.replace(priorityMatch[0], '').trim()
  }

  const dueDate = parseDueDate(remainder)
  if (dueDate) {
    remainder = remainder
      .replace(/\b(tomorrow|today|next\s+week|next\s+(mon|tue|wed|thu|fri|sat|sun)(day)?|mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?)(\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?)?/i, '')
      .trim()
  }

  return {
    title: remainder,
    priority,
    dueDate,
    tags,
  }
}

function parseDueDate(input: string): string | undefined {
  const normalized = input.toLowerCase()
  const now = new Date()

  let target: Date | null = null
  if (normalized.includes('tomorrow')) {
    target = new Date(now)
    target.setDate(target.getDate() + 1)
  } else if (normalized.includes('today')) {
    target = new Date(now)
  } else if (normalized.includes('next week')) {
    target = new Date(now)
    target.setDate(target.getDate() + 7)
  } else {
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const found = weekdays.findIndex((day) => new RegExp(`\\b${day}`).test(normalized))
    if (found !== -1) {
      const diff = (found - now.getDay() + 7) % 7 || 7
      target = new Date(now)
      target.setDate(target.getDate() + diff)
    }
  }

  if (!target) return undefined

  const timeMatch = normalized.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
  if (timeMatch) {
    let hour = Number(timeMatch[1])
    const minute = Number(timeMatch[2] ?? '0')
    const meridian = timeMatch[3]
    if (meridian === 'pm' && hour < 12) hour += 12
    if (meridian === 'am' && hour === 12) hour = 0
    target.setHours(hour, minute, 0, 0)
  } else {
    target.setHours(9, 0, 0, 0)
  }

  return target.toISOString()
}
