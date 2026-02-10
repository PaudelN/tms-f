<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '@/types'

const props = defineProps<{ status: TaskStatus }>()

const classes = computed<Record<TaskStatus, string>>(() => ({
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
}))
</script>

<template>
  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="classes[props.status]">
    {{ props.status }}
  </span>
</template>
