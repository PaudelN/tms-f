<script setup lang="ts">
import { Button } from '@/components/ui/button'
defineProps<{ title: string; description?: string; actionLabel?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-5 shadow-soft">
    <div>
      <h1 class="text-xl font-semibold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <Button v-if="actionLabel" @click="$emit('action')">{{ actionLabel }}</Button>
  </div>
</template>
