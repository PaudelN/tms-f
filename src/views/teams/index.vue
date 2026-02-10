<script setup lang="ts">
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiListCard from '@/components/shared/UiListCard.vue'

const teams = [
  { id: 1, name: 'Platform', members: 9 },
  { id: 2, name: 'Product', members: 7 },
  { id: 3, name: 'Operations', members: 6 },
]
</script>

<template>
  <div class="space-y-4">
    <UiPageHeader title="Teams" description="Fake route with reusable cards." />
    <div class="grid gap-3 md:grid-cols-3">
      <UiListCard v-for="team in teams" :key="team.id">
        <p class="font-medium text-foreground">{{ team.name }}</p>
        <p class="text-sm text-muted-foreground">{{ team.members }} members</p>
      </UiListCard>
    </div>
  </div>
</template>
