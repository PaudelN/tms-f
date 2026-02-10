<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/types/models'
interface Props { status: TaskStatus }
defineProps<Props>()
</script>

<template>
  <Badge variant="outline" class="capitalize">{{ status.replace('-', ' ') }}</Badge>
</template>
