<script setup lang="ts">
interface Props { title: string; description?: string }
withDefaults(defineProps<Props>(), { description: '' })
</script>

<template>
  <div class="rounded-xl border border-dashed border-border bg-card p-8 text-center">
    <h3 class="text-base font-semibold">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>
