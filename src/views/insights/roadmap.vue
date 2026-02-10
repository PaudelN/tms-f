<script setup lang="ts">
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiSectionCard from '@/components/shared/UiSectionCard.vue'
import { Progress } from '@/components/ui/progress'

const phases = [
  { phase: 'Q1', objective: 'Core platform hardening', progress: 70 },
  { phase: 'Q2', objective: 'Workspace AI co-pilot', progress: 40 },
  { phase: 'Q3', objective: 'Global search federation', progress: 10 },
]
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Roadmap" description="Synthetic long-horizon planning surface." />
    <UiSectionCard title="Execution Phases">
      <div class="space-y-3">
        <div v-for="item in phases" :key="item.phase" class="rounded-xl border border-border bg-muted/30 p-4">
          <div class="mb-2 flex items-center justify-between">
            <p class="font-semibold">{{ item.phase }}</p>
            <p class="text-sm text-muted-foreground">{{ item.progress }}%</p>
          </div>
          <p class="text-sm">{{ item.objective }}</p>
          <Progress class="mt-3" :model-value="item.progress" />
        </div>
      </div>
    </UiSectionCard>
  </div>
</template>
