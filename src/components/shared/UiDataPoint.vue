<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
<template>
  <div class="flex items-center justify-between gap-4 border-b border-border/60 pb-2 text-sm">
    <dt class="text-muted-foreground">{{ label }}</dt>
    <dd class="font-medium">{{ value }}</dd>
  </div>
</template>
