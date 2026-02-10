<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, MoreVertical } from 'lucide-vue-next'
import type { Task } from '@/types/models'
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge from './StatusBadge.vue'
import { relativeDate } from '@/utils/format'

const props = withDefaults(defineProps<{ task: Task; variant?: 'list' | 'board' }>(), { variant: 'list' })

const emit = defineEmits<{
  (e: 'click', task: Task): void
  (e: 'statusChange', task: Task): void
  (e: 'delete', task: Task): void
}>()

const overdue = computed(() => !!props.task.dueDate && new Date(props.task.dueDate) < new Date() && props.task.status !== 'done')
</script>

<template>
  <article
    class="rounded-xl border bg-card p-3 shadow-sm transition hover:shadow-md"
    :class="{ 'border-l-4 border-l-destructive': overdue }"
    @click="emit('click', task)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-2">
        <Checkbox :checked="task.status === 'done'" @update:checked="emit('statusChange', task)" @click.stop />
        <div>
          <h3 class="font-medium" :class="{ 'line-through text-muted-foreground': task.status === 'done' }">{{ task.title }}</h3>
          <p v-if="variant === 'list' && task.description" class="text-sm text-muted-foreground line-clamp-1">{{ task.description }}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child @click.stop>
          <Button size="icon" variant="ghost" class="h-7 w-7">
            <MoreVertical class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click.stop="emit('delete', task)">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="mt-3 flex items-center gap-2 text-xs">
      <PriorityBadge :priority="task.priority" />
      <StatusBadge :status="task.status" />
      <span v-if="task.dueDate" class="inline-flex items-center gap-1 text-muted-foreground"><Calendar class="h-3 w-3" />{{ relativeDate(task.dueDate) }}</span>
    </div>
  </article>
</template>
