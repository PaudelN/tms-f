<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
<template>
  <div class="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
    <h1 class="text-2xl font-semibold tracking-tight text-foreground">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
