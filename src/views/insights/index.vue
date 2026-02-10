<script setup lang="ts">
import { computed, ref } from 'vue'
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiTable, { type UiTableColumn } from '@/components/shared/UiTable.vue'
import UiMetricGrid from '@/components/shared/UiMetricGrid.vue'
import UiStatCard from '@/components/shared/UiStatCard.vue'

type InsightRow = {
  id: number
  stream: string
  owner: string
  status: 'Healthy' | 'Risk' | 'Blocked'
  velocity: number
}

const rows = ref<InsightRow[]>([
  { id: 1, stream: 'Onboarding rewrite', owner: 'Ava', status: 'Healthy', velocity: 93 },
  { id: 2, stream: 'Payments migration', owner: 'Noah', status: 'Risk', velocity: 61 },
  { id: 3, stream: 'Auth hardening', owner: 'Liam', status: 'Blocked', velocity: 40 },
  { id: 4, stream: 'AI routing layer', owner: 'Mia', status: 'Healthy', velocity: 87 },
])

const columns: UiTableColumn<InsightRow>[] = [
  { key: 'stream', label: 'Stream', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'velocity', label: 'Velocity %', sortable: true },
]

const healthy = computed(() => rows.value.filter((item) => item.status === 'Healthy').length)
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Executive Insights" description="Synthetic data route showcasing reusable table patterns." />
    <UiMetricGrid>
      <UiStatCard label="Streams" :value="rows.length" />
      <UiStatCard label="Healthy" :value="healthy" />
      <UiStatCard label="At Risk" :value="rows.filter((item) => item.status === 'Risk').length" />
      <UiStatCard label="Blocked" :value="rows.filter((item) => item.status === 'Blocked').length" />
    </UiMetricGrid>
    <UiTable :data="rows" :columns="columns" row-key="id">
      <template #cell-status="{ value }">
        <span
          class="rounded-full px-2 py-1 text-xs font-medium"
          :class="
            value === 'Healthy'
              ? 'bg-emerald-500/10 text-emerald-600'
              : value === 'Risk'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-destructive/10 text-destructive'
          "
        >
          {{ value }}
        </span>
      </template>
    </UiTable>
  </div>
</template>
