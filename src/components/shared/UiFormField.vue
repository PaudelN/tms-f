<script setup lang="ts">
import { Label } from '@/components/ui/label'
defineProps<{ label: string; description?: string }>()
</script>
<template>
  <div class="space-y-2">
    <Label class="text-sm font-medium">{{ label }}</Label>
    <slot />
    <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
  </div>
</template>
