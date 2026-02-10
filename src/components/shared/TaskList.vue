<script setup lang="ts">
import { computed } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task, TaskStatus } from '@/types'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  toggleStatus: [task: Task]
  edit: [task: Task]
  remove: [task: Task]
}>()

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'review', 'done']

const grouped = computed(() =>
  statusOrder.map((status) => ({
    status,
    items: props.tasks.filter((task) => task.status === status),
  })),
)
</script>

<template>
  <section class="space-y-6">
    <div v-for="group in grouped" :key="group.status" class="space-y-2">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {{ group.status }} ({{ group.items.length }})
      </h2>
      <div class="space-y-2">
        <TaskCard
          v-for="task in group.items"
          :key="task.id"
          :task="task"
          variant="list"
          @toggle-status="emit('toggleStatus', task)"
          @edit="emit('edit', task)"
          @remove="emit('remove', task)"
        />
      </div>
    </div>
  </section>
</template>
