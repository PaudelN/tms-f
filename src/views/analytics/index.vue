<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const cards = [
  { label: 'Velocity', value: '94%', note: 'Sprint completion' },
  { label: 'Cycle Time', value: '3.1d', note: 'Avg from todo to done' },
  { label: 'Escaped Bugs', value: '2', note: 'Last 30 days' },
]
</script>

<template>
  <section class="grid gap-4 md:grid-cols-3">
    <Card v-for="card in cards" :key="card.label" class="rounded-2xl shadow-soft">
      <CardHeader><CardTitle class="text-sm text-muted-foreground">{{ card.label }}</CardTitle></CardHeader>
      <CardContent><p class="text-3xl font-semibold">{{ card.value }}</p><p class="text-xs text-muted-foreground">{{ card.note }}</p></CardContent>
    </Card>
  </section>
</template>
