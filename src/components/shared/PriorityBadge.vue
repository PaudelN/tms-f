<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { TaskPriority } from '@/types/models'

const props = defineProps<{ priority: TaskPriority }>()

const variantClass = computed(() => ({
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
}[props.priority]))
</script>

<template>
  <Badge :class="variantClass">{{ priority }}</Badge>
</template>
