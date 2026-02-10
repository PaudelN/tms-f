<script setup lang="ts">
import { ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { parseTaskInput } from '@/utils/parser'

const tasksStore = useTasksStore()
const value = ref('')

async function add() {
  if (!value.value.trim()) return
  const parsed = parseTaskInput(value.value)
  await tasksStore.createTask({
    title: parsed.title,
    projectId: 'p1',
    priority: parsed.priority,
    dueDate: parsed.dueDate?.toISOString(),
    tags: parsed.tags,
  })
  value.value = ''
}
</script>

<template>
  <div class="flex gap-2">
    <input v-model="value" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Buy groceries tomorrow @high #personal" @keydown.enter.prevent="add" />
    <button class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" @click="add">Add</button>
  </div>
</template>
