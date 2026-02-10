<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

defineProps<{ title: string; description: string; ctaLabel?: string }>()
defineEmits<{ cta: [] }>()
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-10 text-center shadow-soft">
    <Inbox class="mx-auto mb-3 size-10 text-muted-foreground" />
    <h3 class="text-base font-semibold">{{ title }}</h3>
    <p class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    <Button v-if="ctaLabel" class="mt-4" @click="$emit('cta')">{{ ctaLabel }}</Button>
  </div>
</template>
