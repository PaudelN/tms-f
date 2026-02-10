import type { TaskPriority } from '@/types/models'

export interface ParsedTask {
  title: string
  dueDate?: Date
  priority?: TaskPriority
  tags: string[]
}

export function parseTaskInput(input: string): ParsedTask {
  let remaining = input.trim()
  const parsed: ParsedTask = { title: '', tags: [] }
  const priorityMatch = remaining.match(/@(low|medium|high|urgent)\b/i)
  if (priorityMatch) {
    parsed.priority = priorityMatch[1].toLowerCase() as TaskPriority
    remaining = remaining.replace(priorityMatch[0], '').trim()
  }
  const tags = remaining.matchAll(/#([\w-]+)/g)
  for (const tag of tags) {
    parsed.tags.push(tag[1])
    remaining = remaining.replace(tag[0], '').trim()
  }
  const parsedDate = parseDateToken(remaining)
  if (parsedDate) {
    parsed.dueDate = parsedDate.date
    remaining = parsedDate.remaining
  }
  parsed.title = remaining.replace(/\s+/g, ' ').trim()
  return parsed
}

function parseDateToken(input: string): { date: Date; remaining: string } | null {
  const now = new Date()
  const rules: Array<{ pattern: RegExp; date: () => Date }> = [
    { pattern: /\btomorrow\b/i, date: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
    { pattern: /\btoday\b/i, date: () => new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
    { pattern: /\bnext\s+friday\b/i, date: () => nextWeekday(now, 5) },
    { pattern: /\bfriday\b/i, date: () => nextWeekday(now, 5) },
  ]

  for (const rule of rules) {
    const match = input.match(rule.pattern)
    if (!match) continue
    const date = rule.date()
    const remaining = input.replace(match[0], '').replace(/\bdue\b/i, '').trim()
    return { date, remaining }
  }

  const inDays = input.match(/\bin\s+(\d+)\s+days?\b/i)
  if (inDays) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + Number(inDays[1]))
    return { date, remaining: input.replace(inDays[0], '').trim() }
  }
  return null
}

function nextWeekday(from: Date, weekday: number): Date {
  const current = from.getDay()
  let plus = weekday - current
  if (plus <= 0) plus += 7
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + plus)
}
