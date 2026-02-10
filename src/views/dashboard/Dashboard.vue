<script setup lang="ts">
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiKpiGrid from '@/components/shared/UiKpiGrid.vue'
import UiStatCard from '@/components/shared/UiStatCard.vue'
import UiSurface from '@/components/shared/UiSurface.vue'
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader title="Executive Dashboard" description="A calm snapshot of system health and delivery velocity." />
    <UiKpiGrid>
      <UiStatCard label="Delivery health" value="96%" hint="Last 30 days" />
      <UiStatCard label="Throughput" value="182 tasks" hint="This sprint" />
      <UiStatCard label="Incidents" value="2" hint="Both resolved" />
      <UiStatCard label="Automation" value="73%" hint="Coverage" />
    </UiKpiGrid>
    <UiSurface>
      <p class="text-sm text-muted-foreground">
        This dashboard now uses reusable shadcn-powered shared components and claymorphic surfaces to keep the UI serious and consistent.
      </p>
    </UiSurface>
  </div>
</template>
