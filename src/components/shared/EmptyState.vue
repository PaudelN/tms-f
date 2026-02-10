<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="rounded-xl border border-dashed p-10 text-center">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p v-if="description" class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>
