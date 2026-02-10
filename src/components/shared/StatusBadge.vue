<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/types/models'

const props = defineProps<{ status: TaskStatus }>()

const classes = computed(() => ({
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700'
}[props.status]))
</script>

<template>
  <Badge :class="classes">{{ status }}</Badge>
</template>
