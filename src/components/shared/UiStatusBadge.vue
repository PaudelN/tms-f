<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
defineProps<{ status: 'active' | 'archived' | 'draft' | 'danger' }>()
</script>
<template>
  <Badge :variant="status === 'danger' ? 'destructive' : 'secondary'" class="capitalize">{{ status }}</Badge>
</template>
