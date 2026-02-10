<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { UiEmptyState, UiMetricGrid, UiPageHeader, UiStatCard, UiTable } from '@/components/shared'

interface ProjectRow { id: number; name: string; owner: string; status: string; budget: number }

const projects = ref<ProjectRow[]>([
  { id: 1, name: 'Apollo CRM', owner: 'Avery', status: 'active', budget: 132000 },
  { id: 2, name: 'Orion Data Lake', owner: 'Nadia', status: 'draft', budget: 98000 },
  { id: 3, name: 'Mercury QA', owner: 'Kenji', status: 'active', budget: 41000 },
])

const columns = [
  { key: 'name', label: 'Project', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'budget', label: 'Budget', sortable: true, type: 'numeric' as const },
  { key: 'actions', label: '', type: 'actions' as const },
]
</script>

<template>
  <div class="space-y-5">
    <UiPageHeader title="Projects" description="Fake data route for reusable SPA patterns.">
      <template #actions><Button>Create project</Button></template>
    </UiPageHeader>

    <UiMetricGrid>
      <UiStatCard label="Total Projects" :value="projects.length" />
      <UiStatCard label="Active" :value="projects.filter((x) => x.status === 'active').length" />
      <UiStatCard label="Budget" :value="`$${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}`" />
      <UiStatCard label="Owners" :value="new Set(projects.map((x) => x.owner)).size" />
    </UiMetricGrid>

    <UiTable :data="projects" :columns="columns" />

    <UiEmptyState title="Roadmap" description="Further fake endpoints can be wired in services/ with optimistic actions." />
  </div>
</template>
