import type { TaskPriority } from '@/types/models'

export interface ParsedTaskInput {
  title: string
  dueDate: Date | null
  priority: TaskPriority
  tags: string[]
}

export function parseTaskInput(input: string): ParsedTaskInput {
  let content = input.trim()
  const tags = Array.from(content.matchAll(/#(\w+)/g)).map((item) => item[1])
  tags.forEach((tag) => { content = content.replace(`#${tag}`, '').trim() })

  const priorityMatch = content.match(/@(low|medium|high|urgent)/i)
  const priority = (priorityMatch?.[1]?.toLowerCase() as TaskPriority | undefined) ?? 'medium'
  if (priorityMatch) content = content.replace(priorityMatch[0], '').trim()

  let dueDate: Date | null = null
  if (/\btomorrow\b/i.test(content)) {
    dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 1)
    dueDate.setHours(0, 0, 0, 0)
    content = content.replace(/\btomorrow\b/i, '').trim()
  }

  return { title: content, dueDate, priority, tags }
}
