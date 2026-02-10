<script setup lang="ts">
defineProps<{ label: string; value: string | number; helper?: string }>()
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-4 shadow-soft">
    <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold">{{ value }}</p>
    <p v-if="helper" class="mt-1 text-xs text-muted-foreground">{{ helper }}</p>
  </div>
</template>
