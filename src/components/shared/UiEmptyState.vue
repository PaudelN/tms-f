<script setup lang="ts">
import { Button } from '@/components/ui/button'
defineProps<{ title: string; description: string; ctaLabel?: string }>()
const emit = defineEmits<{ cta: [] }>()
</script>
<template>
  <div class="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-soft">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{{ description }}</p>
    <Button v-if="ctaLabel" class="mt-5" @click="emit('cta')">{{ ctaLabel }}</Button>
  </div>
</template>
