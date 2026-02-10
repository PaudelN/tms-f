<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <section class="rounded-xl border border-border bg-card p-4 shadow-soft">
    <header class="mb-4">
      <h2 class="text-base font-semibold">{{ title }}</h2>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>
