<script setup lang="ts">
import { computed } from 'vue'
import type { TaskPriority } from '@/types/models'

interface Props { priority: TaskPriority }
const props = defineProps<Props>()

const classes = computed(() => ({
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}[props.priority]))
</script>

<template>
  <span :class="['rounded-full px-2 py-0.5 text-xs font-medium capitalize', classes]">{{ priority }}</span>
</template>
