<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import type { TaskPriority } from '@/types/models'
interface Props { priority: TaskPriority }
defineProps<Props>()
</script>

<template>
  <Badge :variant="priority === 'urgent' ? 'destructive' : 'secondary'" class="capitalize">{{ priority }}</Badge>
</template>
