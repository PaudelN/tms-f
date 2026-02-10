<script setup lang="ts">
interface Props { title: string; description: string }
defineProps<Props>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-border p-8 text-center">
    <h3 class="font-semibold">{{ title }}</h3>
    <p class="text-sm text-muted-foreground mt-1">{{ description }}</p>
  </div>
</template>
