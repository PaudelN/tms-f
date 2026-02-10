<script setup lang="ts">
defineProps<{ label: string; value?: string | number | null }>();
</script>
<template>
  <div class="space-y-1 rounded-lg border border-border p-3">
    <p class="text-xs uppercase text-muted-foreground">{{ label }}</p>
    <p class="text-sm font-medium">{{ value ?? '—' }}</p>
  </div>
</template>
