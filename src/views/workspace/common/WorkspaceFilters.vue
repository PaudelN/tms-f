<template>
  <div class="bg-card rounded-xl shadow-sm border border-border p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-xs font-medium text-muted-foreground mb-2">Filter by Owner</label>
        <select
          :value="filterOwner"
          class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          @change="updateOwner"
        >
          <option value="">All Owners</option>
          <option v-for="owner in uniqueOwners" :key="owner.id" :value="owner.id">
            {{ owner.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-muted-foreground mb-2">Filter by Status</label>
        <select
          :value="filterStatus"
          class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          @change="updateStatus"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-muted-foreground mb-2">View Mode</label>
          <UiViews :model-value="currentView" @update:model-value="emit('update:currentView', $event)" />
        </div>

        <div class="relative">
          <button
            type="button"
            class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all text-sm font-medium whitespace-nowrap"
            @click="emit('toggleExportMenu')"
          >
            Export
          </button>
          <div
            v-if="showExportMenu"
            class="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg py-2 z-50"
          >
            <button
              type="button"
              class="w-full px-4 py-2 text-left text-sm hover:bg-accent text-popover-foreground transition-colors"
              @click="emit('export', 'csv')"
            >
              CSV
            </button>
            <button
              type="button"
              class="w-full px-4 py-2 text-left text-sm hover:bg-accent text-popover-foreground transition-colors"
              @click="emit('export', 'json')"
            >
              JSON
            </button>
          </div>
        </div>

        <button
          type="button"
          class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all text-sm font-medium whitespace-nowrap"
          @click="emit('share')"
        >
          Share
        </button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 flex-wrap">
      <span class="text-xs text-muted-foreground">Active filters:</span>
      <button
        v-if="quickSearchQuery"
        type="button"
        class="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
        @click="emit('update:quickSearchQuery', '')"
      >
        <span>"{{ quickSearchQuery }}"</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        v-if="filterOwner"
        type="button"
        class="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
        @click="emit('update:filterOwner', '')"
      >
        <span>{{ getOwnerName(filterOwner) }}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        v-if="filterStatus"
        type="button"
        class="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
        @click="emit('update:filterStatus', '')"
      >
        <span>{{ filterStatus }}</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        type="button"
        class="px-2.5 py-1 bg-destructive/10 text-destructive text-xs rounded-lg hover:bg-destructive/20 transition-colors"
        @click="emit('clearAllFilters')"
      >
        Clear all
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViewMode } from "@/ui-table/types/table.types";
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

function updateOwner(event: Event) {
  emit("update:filterOwner", (event.target as HTMLSelectElement).value);
}

function updateStatus(event: Event) {
  emit("update:filterStatus", (event.target as HTMLSelectElement).value);
}
</script>
