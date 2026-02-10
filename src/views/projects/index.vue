<script setup lang="ts">
import UiPageHeader from '@/components/shared/UiPageHeader.vue'
import UiTable, { type UiTableColumn } from '@/components/shared/UiTable.vue'

interface ProjectRow { id: number; name: string; lead: string; risk: string; updated: string }

const rows: ProjectRow[] = [
  { id: 11, name: 'Identity Revamp', lead: 'Sana', risk: 'Low', updated: '2026-02-02' },
  { id: 12, name: 'Billing v2', lead: 'Rami', risk: 'Medium', updated: '2026-02-07' },
]

const columns: UiTableColumn<ProjectRow>[] = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'lead', label: 'Lead', sortable: true },
  { key: 'risk', label: 'Risk', sortable: true },
  { key: 'updated', label: 'Updated', sortable: true },
]
</script>

<template>
  <div class="space-y-4">
    <UiPageHeader title="Projects" description="Fake data route for SPA navigation validation." />
    <UiTable :data="rows" :columns="columns" />
  </div>
</template>
