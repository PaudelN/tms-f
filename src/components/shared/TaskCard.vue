<script setup lang="ts">
import { computed } from 'vue'
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge from './StatusBadge.vue'
import UserAvatar from './UserAvatar.vue'
import type { Task } from '@/types'
import { formatRelativeDate } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    task: Task
    variant?: 'list' | 'board'
  }>(),
  { variant: 'list' },
)

const emit = defineEmits<{
  toggleStatus: [task: Task]
  edit: [task: Task]
  remove: [task: Task]
}>()

const isDone = computed(() => props.task.status === 'done')
</script>

<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    :class="{ 'opacity-60': isDone, 'space-y-3': variant === 'board' }"
  >
    <header class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="truncate font-semibold text-slate-900" :class="{ 'line-through': isDone }">{{ task.title }}</h3>
        <p v-if="task.description" class="mt-1 line-clamp-2 text-sm text-slate-500">{{ task.description }}</p>
      </div>
      <PriorityBadge :priority="task.priority" />
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <StatusBadge :status="task.status" />
      <span class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{{ formatRelativeDate(task.dueDate) }}</span>
      <span v-for="tag in task.tags" :key="tag" class="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700">#{{ tag }}</span>
    </div>

    <footer class="flex items-center justify-between gap-2">
      <UserAvatar :name="task.assignee?.name" :avatar="task.assignee?.avatar" />
      <div class="flex items-center gap-2">
        <button class="rounded-lg border px-2 py-1 text-xs" type="button" @click="emit('toggleStatus', task)">
          {{ task.status === 'done' ? 'Reopen' : 'Done' }}
        </button>
        <button class="rounded-lg border px-2 py-1 text-xs" type="button" @click="emit('edit', task)">Edit</button>
        <button class="rounded-lg border px-2 py-1 text-xs text-red-600" type="button" @click="emit('remove', task)">Delete</button>
      </div>
    </footer>
  </article>
</template>
