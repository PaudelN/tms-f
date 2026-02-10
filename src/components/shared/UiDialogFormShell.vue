<script setup lang="ts">
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
defineProps<{ title: string; description?: string }>()
</script>
<template>
  <DialogHeader>
    <DialogTitle>{{ title }}</DialogTitle>
    <DialogDescription v-if="description">{{ description }}</DialogDescription>
  </DialogHeader>
  <div class="mt-4">
    <slot />
  </div>
</template>
