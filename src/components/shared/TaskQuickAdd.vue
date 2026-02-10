<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseTaskInput } from '@/utils/parser'

const text = ref('')
const emit = defineEmits<{ create:[{ title: string; dueDate?: Date; tags: string[]; priority?: 'low'|'medium'|'high'|'urgent' }] }>()

function submit(): void {
  if (!text.value.trim()) return
  emit('create', parseTaskInput(text.value))
  text.value = ''
}
</script>

<template>
  <form class="flex gap-2" @submit.prevent="submit">
    <Input v-model="text" placeholder='Try "Buy groceries tomorrow @high #personal"' />
    <Button type="submit">Add</Button>
  </form>
</template>
