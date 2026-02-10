<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
<template>
  <div class="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 p-6 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)]">
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">{{ title }}</h1>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
