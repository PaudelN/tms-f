<script setup lang="ts">
import { ref } from 'vue'
import { parseTaskInput } from '@/utils/parser'
import type { TaskPriority } from '@/types'

const emit = defineEmits<{
  create: [payload: { title: string; dueDate?: string; priority?: TaskPriority; tags: string[] }]
}>()

const input = ref('')

function submit(): void {
  const parsed = parseTaskInput(input.value)
  if (!parsed.title) return

  emit('create', {
    title: parsed.title,
    dueDate: parsed.dueDate,
    priority: parsed.priority,
    tags: parsed.tags,
  })

  input.value = ''
}
</script>

<template>
  <form class="flex flex-col gap-2 rounded-xl border bg-white p-3" @submit.prevent="submit">
    <label class="text-sm font-medium text-slate-700" for="task-input">Quick add (NLP enabled)</label>
    <input
      id="task-input"
      v-model="input"
      type="text"
      class="rounded-lg border px-3 py-2 text-sm"
      placeholder="Buy groceries tomorrow @high #personal"
    />
    <button type="submit" class="self-end rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
      Add task
    </button>
  </form>
</template>
