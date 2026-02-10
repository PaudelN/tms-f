<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>
<template>
  <div class="rounded-xl border border-border bg-card p-4 shadow-soft">
    <Skeleton class="mb-4 h-8 w-56" />
    <div class="space-y-2">
      <Skeleton v-for="i in 6" :key="i" class="h-12 w-full" />
    </div>
  </div>
</template>
