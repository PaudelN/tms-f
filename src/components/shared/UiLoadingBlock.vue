<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>
<template>
  <div class="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
    <Skeleton class="h-8 w-1/3" />
    <Skeleton class="h-20 w-full" />
    <Skeleton class="h-20 w-full" />
  </div>
</template>
