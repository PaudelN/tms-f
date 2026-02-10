<script setup lang="ts">
import UiPageHeader from "@/components/shared/UiPageHeader.vue";
import UiTable, { type UiTableColumn } from "@/components/shared/UiTable.vue";
import { clients, type ClientRecord } from "@/features/mock-data/data";

const columns: UiTableColumn<ClientRecord>[] = [
  { key: "name", label: "Client", sortable: true },
  { key: "tier", label: "Tier", sortable: true },
  { key: "owner", label: "Owner" },
];
</script>
<template>
  <div class="space-y-4">
    <UiPageHeader title="Clients" description="Sample SPA route backed by local fake data." />
    <UiTable :data="clients" :columns="columns" />
  </div>
</template>
