<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>
<template>
  <div class="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
    <p class="text-lg font-medium text-foreground">{{ title }}</p>
    <p class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
    <div class="mt-4 flex justify-center"><slot /></div>
  </div>
</template>
