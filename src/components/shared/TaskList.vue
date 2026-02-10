<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import TaskCard from '@/components/shared/TaskCard.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import LoadingState from '@/components/shared/LoadingState.vue'
import type { Task, TaskStatus } from '@/types/models'

interface Props { tasks: Task[]; loading?: boolean; groupBy?: 'status'|'priority'|'assignee'|'project'|'none' }
const props = withDefaults(defineProps<Props>(), { loading: false, groupBy: 'status' })
const emit = defineEmits<{ taskClick:[Task]; taskEdit:[Task]; taskDelete:[Task]; taskStatusChange:[Task, TaskStatus] }>()
const collapsed = ref<Set<string>>(new Set())

const groups = computed<Record<string, Task[]>>(() => {
  if (props.groupBy === 'none') return { 'All Tasks': props.tasks }
  const map: Record<string, Task[]> = {}
  props.tasks.forEach((task) => {
    const key = props.groupBy === 'status'
      ? task.status
      : props.groupBy === 'priority'
        ? task.priority
        : props.groupBy === 'assignee'
          ? task.assignee?.name ?? 'Unassigned'
          : task.project?.name ?? 'No Project'
    map[key] = [...(map[key] ?? []), task]
  })
  return map
})

const order: TaskStatus[] = ['todo', 'in-progress', 'review', 'done']
const orderedGroups = computed(() => {
  const entries = Object.entries(groups.value)
  if (props.groupBy !== 'status') return entries
  return entries.sort((a, b) => order.indexOf(a[0] as TaskStatus) - order.indexOf(b[0] as TaskStatus))
})

function toggle(key: string): void {
  if (collapsed.value.has(key)) collapsed.value.delete(key)
  else collapsed.value.add(key)
}
</script>

<template>
  <LoadingState v-if="loading" />
  <EmptyState v-else-if="tasks.length === 0" title="No tasks yet" description="Create your first task to get started." />
  <div v-else class="space-y-5">
    <section v-for="[name, bucket] in orderedGroups" :key="name" class="space-y-2">
      <button class="flex items-center gap-2 text-sm font-medium" @click="toggle(name)">
        <ChevronRight v-if="collapsed.has(name)" class="h-4 w-4" />
        <ChevronDown v-else class="h-4 w-4" />
        <span class="capitalize">{{ name }}</span>
        <span class="text-muted-foreground">({{ bucket.length }})</span>
      </button>
      <div v-show="!collapsed.has(name)" class="space-y-2">
        <TaskCard
          v-for="task in bucket"
          :key="task.id"
          :task="task"
          @click="emit('taskClick', task)"
          @edit="emit('taskEdit', task)"
          @delete="emit('taskDelete', task)"
          @status-change="(item, status) => emit('taskStatusChange', item, status)"
        />
      </div>
    </section>
  </div>
</template>
