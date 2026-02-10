<script setup lang="ts">
import UiPageHeader from "@/components/shared/UiPageHeader.vue";
import UiTable, { type UiTableColumn } from "@/components/shared/UiTable.vue";
import UiStatusBadge from "@/components/shared/UiStatusBadge.vue";
import { reports, type ReportRecord } from "@/features/mock-data/data";

const columns: UiTableColumn<ReportRecord>[] = [
  { key: "title", label: "Report", sortable: true },
  { key: "period", label: "Period", sortable: true },
  { key: "status", label: "Status", sortable: true },
];
</script>
<template>
  <div class="space-y-4">
    <UiPageHeader title="Reports" description="Additional route with deterministic fake records." />
    <UiTable :data="reports" :columns="columns">
      <template #cell-status="{ row }">
        <UiStatusBadge :label="String(row.status)" :tone="String(row.status) === 'Published' ? 'default' : 'outline'" />
      </template>
    </UiTable>
  </div>
</template>
