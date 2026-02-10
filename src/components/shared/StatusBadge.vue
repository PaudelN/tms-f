<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus } from '@/types/models'

interface Props { status: TaskStatus }
const props = defineProps<Props>()

const classes = computed(() => ({
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-purple-100 text-purple-700',
  done: 'bg-emerald-100 text-emerald-700',
}[props.status]))
</script>

<template>
  <span :class="['rounded-full px-2 py-0.5 text-xs font-medium capitalize', classes]">{{ status }}</span>
</template>
