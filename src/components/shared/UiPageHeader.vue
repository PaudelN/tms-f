<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  title: string
  description: string
  actionLabel?: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-soft md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">{{ title }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <Button v-if="actionLabel" @click="emit('action')">{{ actionLabel }}</Button>
  </div>
</template>
