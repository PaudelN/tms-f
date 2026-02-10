<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { parseTaskInput } from '@/utils/parser'
import { useTasksStore } from '@/stores/tasks'

const tasksStore = useTasksStore()
const input = ref('')

const addTask = async () => {
  if (!input.value.trim()) return
  const parsed = parseTaskInput(input.value)

  await tasksStore.createTask({
    title: parsed.title,
    priority: parsed.priority,
    projectId: tasksStore.currentProjectId || 'inbox',
    dueDate: parsed.dueDate?.toISOString(),
    tags: parsed.tags
  })

  input.value = ''
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Input v-model="input" placeholder='Try: "Buy groceries tomorrow @high #personal"' @keyup.enter="addTask" />
    <Button @click="addTask">Add</Button>
  </div>
</template>
