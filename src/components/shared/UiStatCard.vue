<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>()
</script>
<template>
  <div class="rounded-2xl border border-border/70 bg-card p-4 shadow-[0_10px_20px_-16px_rgba(30,41,59,0.45)]">
    <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold text-foreground">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>
