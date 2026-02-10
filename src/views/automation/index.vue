<script setup lang="ts">
import { ref } from 'vue'
import { Bot, Workflow } from 'lucide-vue-next'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiSectionCard from '@/components/shared/UiSectionCard.vue'
import UiListTile from '@/components/shared/UiListTile.vue'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'

const automations = ref([
  { id: 1, name: 'Stale ticket nudger', cadence: 'Daily 9:00', status: 'Enabled' },
  { id: 2, name: 'Overrun notifier', cadence: 'Hourly', status: 'Enabled' },
  { id: 3, name: 'Sprint closeout summary', cadence: 'Friday 17:00', status: 'Draft' },
])

function runSimulation() {
  toast.success('Automation simulation started', 'Synthetic workflow triggered successfully.')
}
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Automation Studio" description="Fake data route with reusable cards and actions." />

    <UiSectionCard title="Workflow Controls" description="Design, audit, and trigger smart routines.">
      <div class="grid gap-3 md:grid-cols-2">
        <UiListTile v-for="item in automations" :key="item.id">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium">{{ item.name }}</p>
              <p class="text-sm text-muted-foreground">{{ item.cadence }}</p>
            </div>
            <span class="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{{ item.status }}</span>
          </div>
        </UiListTile>
      </div>
    </UiSectionCard>

    <UiSectionCard title="Quick Simulation">
      <div class="flex items-center gap-3">
        <div class="rounded-xl bg-muted p-3"><Bot class="size-6" /></div>
        <div class="rounded-xl bg-muted p-3"><Workflow class="size-6" /></div>
        <Button @click="runSimulation">Run Simulation</Button>
      </div>
    </UiSectionCard>
  </div>
</template>
