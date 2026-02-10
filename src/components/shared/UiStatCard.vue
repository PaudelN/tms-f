<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>();
</script>
<template>
  <div class="rounded-xl border border-border bg-card p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
    <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold tabular-nums">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>
