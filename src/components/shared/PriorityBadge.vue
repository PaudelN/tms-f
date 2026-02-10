<script setup lang="ts">
import { computed } from 'vue'
import type { TaskPriority } from '@/types'

const props = defineProps<{ priority: TaskPriority }>()

const classes = computed<Record<TaskPriority, string>>(() => ({
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}))
</script>

<template>
  <span class="rounded-full px-2 py-1 text-xs font-medium capitalize" :class="classes[props.priority]">
    {{ props.priority }}
  </span>
</template>
