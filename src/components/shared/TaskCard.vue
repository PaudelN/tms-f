<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, MessageSquare, MoreVertical, Paperclip } from 'lucide-vue-next'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import UserAvatar from '@/components/shared/UserAvatar.vue'
import PriorityBadge from '@/components/shared/PriorityBadge.vue'
import { formatRelativeDate } from '@/utils/format'
import type { Task, TaskStatus } from '@/types/models'

interface Props { task: Task; variant?: 'list'|'board'; selected?: boolean }
const props = withDefaults(defineProps<Props>(), { variant: 'list', selected: false })
const emit = defineEmits<{ click:[Task]; edit:[Task]; delete:[Task]; statusChange:[Task, TaskStatus] }>()

const isDone = computed(() => props.task.status === 'done')
const dueText = computed(() => formatRelativeDate(props.task.dueDate))
const overdue = computed(() => props.task.dueDate !== null && props.task.status !== 'done' && props.task.dueDate < new Date())

function toggleStatus(): void {
  emit('statusChange', props.task, props.task.status === 'done' ? 'todo' : 'done')
}
</script>

<template>
  <article :class="['rounded-lg border bg-card p-3 shadow-sm transition hover:shadow-md', selected && 'ring-2 ring-primary', overdue && 'border-destructive/60']" @click="emit('click', task)">
    <div v-if="variant === 'list'" class="flex items-start gap-3">
      <Checkbox :checked="isDone" class="mt-1" @click.stop @update:checked="toggleStatus" />
      <div class="min-w-0 flex-1">
        <h3 :class="['font-medium', isDone && 'line-through text-muted-foreground']">{{ task.title }}</h3>
        <p v-if="task.description" class="truncate text-sm text-muted-foreground">{{ task.description }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span v-if="task.attachments?.length" class="inline-flex items-center gap-1"><Paperclip class="h-3 w-3"/>{{ task.attachments.length }}</span>
          <span v-if="task.comments?.length" class="inline-flex items-center gap-1"><MessageSquare class="h-3 w-3"/>{{ task.comments.length }}</span>
          <span v-if="task.actualHours" class="inline-flex items-center gap-1"><Clock class="h-3 w-3"/>{{ task.actualHours }}h</span>
          <Badge v-for="tag in task.tags.slice(0,3)" :key="tag" variant="secondary">#{{ tag }}</Badge>
          <UserAvatar v-if="task.assignee" :user="task.assignee" show-name />
          <span v-if="task.dueDate" class="inline-flex items-center gap-1"><Calendar class="h-3 w-3"/>{{ dueText }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <PriorityBadge :priority="task.priority" />
        <DropdownMenu>
          <DropdownMenuTrigger as-child @click.stop><Button variant="ghost" size="icon" class="h-8 w-8"><MoreVertical class="h-4 w-4"/></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click.stop="emit('edit', task)">Edit</DropdownMenuItem>
            <DropdownMenuItem class="text-destructive" @click.stop="emit('delete', task)">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div v-else class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <PriorityBadge :priority="task.priority" />
        <Button variant="ghost" size="icon" class="h-7 w-7" @click.stop="emit('edit', task)"><MoreVertical class="h-3 w-3"/></Button>
      </div>
      <h4 class="line-clamp-2 text-sm font-medium">{{ task.title }}</h4>
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <UserAvatar v-if="task.assignee" :user="task.assignee" size="xs" />
        <span v-if="task.dueDate">{{ dueText }}</span>
      </div>
    </div>
  </article>
</template>
