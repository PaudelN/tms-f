<script setup lang="ts">
import { UiPageHeader, UiPanel, UiStatCard, UiMetricGrid } from '@/components/shared'
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Reports" description="Executive snapshot route with fake summary data." />
    <UiMetricGrid>
      <UiStatCard label="SLA" value="99.7%" hint="last 30 days" />
      <UiStatCard label="Tickets" value="184" hint="open" />
      <UiStatCard label="Cycle time" value="3.1d" />
      <UiStatCard label="NPS" value="54" />
    </UiMetricGrid>
    <UiPanel>
      <p class="text-sm text-muted-foreground">This route demonstrates extension points for charts and asynchronous report modules.</p>
    </UiPanel>
  </div>
</template>
