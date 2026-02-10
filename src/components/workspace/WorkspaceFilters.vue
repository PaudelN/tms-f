<template>
  <div class="rounded-xl border border-border bg-card p-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="space-y-2">
        <label class="text-xs font-medium text-muted-foreground">Filter by Owner</label>
        <AppSelect
          :model-value="filterOwner"
          placeholder="All Owners"
          :options="ownerOptions"
          class="w-full"
          @update:model-value="emit('update:filterOwner', $event)"
        />
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-muted-foreground">Filter by Status</label>
        <AppSelect
          :model-value="filterStatus"
          placeholder="All Statuses"
          :options="statusOptions"
          class="w-full"
          @update:model-value="emit('update:filterStatus', $event)"
        />
      </div>

      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="mb-2 block text-xs font-medium text-muted-foreground">View Mode</label>
          <UiViews :model-value="currentView" @update:model-value="emit('update:currentView', $event)" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="emit('export', 'csv')">CSV</DropdownMenuItem>
            <DropdownMenuItem @click="emit('export', 'json')">JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" @click="emit('share')">Share</Button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-foreground">Active filters:</span>
      <Button
        v-if="quickSearchQuery"
        variant="secondary"
        size="sm"
        class="h-7 gap-1 px-2 text-xs"
        @click="emit('update:quickSearchQuery', '')"
      >
        "{{ quickSearchQuery }}"
      </Button>
      <Button
        v-if="filterOwner"
        variant="secondary"
        size="sm"
        class="h-7 gap-1 px-2 text-xs"
        @click="emit('update:filterOwner', '')"
      >
        {{ getOwnerName(filterOwner) }}
      </Button>
      <Button
        v-if="filterStatus"
        variant="secondary"
        size="sm"
        class="h-7 gap-1 px-2 text-xs"
        @click="emit('update:filterStatus', '')"
      >
        {{ filterStatus }}
      </Button>
      <Button variant="destructive" size="sm" class="h-7 px-2 text-xs" @click="emit('clearAllFilters')">
        Clear all
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSelect from "@/components/common/AppSelect.vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ViewMode } from "@/ui-table/types/table.types";
import { computed } from "vue";
import UiViews from "@/ui-table/UiViews.vue";

type Owner = {
  id: number;
  name: string;
};

const props = defineProps<{
  filterOwner: string;
  filterStatus: string;
  currentView: ViewMode;
  uniqueOwners: Owner[];
  quickSearchQuery: string;
  hasActiveFilters: boolean;
  showExportMenu: boolean;
  getOwnerName: (ownerId: string) => string;
}>();

const emit = defineEmits<{
  (e: "update:filterOwner", value: string): void;
  (e: "update:filterStatus", value: string): void;
  (e: "update:currentView", value: ViewMode): void;
  (e: "update:quickSearchQuery", value: string): void;
  (e: "toggleExportMenu"): void;
  (e: "export", value: "csv" | "json"): void;
  (e: "share"): void;
  (e: "clearAllFilters"): void;
}>();

const ownerOptions = computed(() =>
  props.uniqueOwners.map((owner) => ({ label: owner.name, value: String(owner.id) })),
);

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];
</script>
