<script setup lang="ts">
import { Button } from '@/components/ui/button'
defineProps<{ label: string }>()
</script>
<template>
  <Button variant="ghost" size="icon" :aria-label="label">
    <slot />
  </Button>
</template>
