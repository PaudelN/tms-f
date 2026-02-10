<script setup lang="ts">
import { Info } from 'lucide-vue-next'
defineProps<{ text: string }>()
</script>

<template>
  <div class="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
    <Info class="mt-0.5 size-4" />
    <p>{{ text }}</p>
  </div>
</template>
