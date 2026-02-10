<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
defineProps<{ label: string; value: string | number; hint?: string }>()
</script>
<template>
  <Card class="rounded-2xl border-border/70 shadow-soft">
    <CardContent class="p-5">
      <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ label }}</p>
      <p class="mt-2 text-2xl font-semibold tabular-nums">{{ value }}</p>
      <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
    </CardContent>
  </Card>
</template>
