<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import TaskCard from './TaskCard.vue'
import EmptyState from './EmptyState.vue'
import LoadingState from './LoadingState.vue'
import type { Task } from '@/types/models'

const props = withDefaults(defineProps<{ tasks: Task[]; loading?: boolean; groupBy?: 'status' | 'priority' | 'none' }>(), {
  loading: false,
  groupBy: 'status'
})

const emit = defineEmits<{
  (e: 'taskClick', task: Task): void
  (e: 'taskStatusChange', task: Task): void
  (e: 'taskDelete', task: Task): void
}>()

const collapsed = ref<Record<string, boolean>>({})

const grouped = computed<Record<string, Task[]>>(() => {
  if (props.groupBy === 'none') return { 'All tasks': props.tasks }

  return props.tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = props.groupBy === 'status' ? task.status : task.priority
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})
})
</script>

<template>
  <LoadingState v-if="loading" />
  <EmptyState v-else-if="tasks.length === 0" title="No tasks yet" description="Create a task to get started" />

  <div v-else class="space-y-5">
    <section v-for="(groupTasks, key) in grouped" :key="key" class="space-y-2">
      <button class="flex items-center gap-2 text-sm font-semibold" @click="collapsed[key] = !collapsed[key]">
        <ChevronRight v-if="collapsed[key]" class="h-4 w-4" />
        <ChevronDown v-else class="h-4 w-4" />
        <span class="capitalize">{{ key }}</span>
        <span class="text-muted-foreground">({{ groupTasks.length }})</span>
      </button>

      <div v-show="!collapsed[key]" class="space-y-2">
        <TaskCard
          v-for="task in groupTasks"
          :key="task.id"
          :task="task"
          @click="emit('taskClick', task)"
          @status-change="emit('taskStatusChange', task)"
          @delete="emit('taskDelete', task)"
        />
      </div>
    </section>
  </div>
</template>
