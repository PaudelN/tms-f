<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  title: string
  description: string
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
    <p class="text-lg font-semibold text-foreground">{{ title }}</p>
    <p class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
    <Button v-if="actionLabel" class="mt-5" @click="emit('action')">{{ actionLabel }}</Button>
  </div>
</template>
