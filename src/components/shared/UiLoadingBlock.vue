<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
defineProps<{ rows?: number }>()
</script>

<template>
  <div class="space-y-3 rounded-xl border border-border bg-card p-4 shadow-soft">
    <Skeleton class="h-7 w-40" />
    <Skeleton v-for="i in rows ?? 4" :key="i" class="h-12 w-full" />
  </div>
</template>
