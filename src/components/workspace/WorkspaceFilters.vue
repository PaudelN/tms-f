<template>
  <div class="rounded-xl border border-border bg-card p-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label class="mb-2 block text-xs font-medium text-muted-foreground">Filter by Owner</label>
        <Select :model-value="ownerValue" @update:model-value="onOwnerChange">
          <SelectTrigger>
            <SelectValue placeholder="All Owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_VALUE">All Owners</SelectItem>
            <SelectItem v-for="owner in uniqueOwners" :key="owner.id" :value="String(owner.id)">
              {{ owner.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-medium text-muted-foreground">Filter by Status</label>
        <Select :model-value="statusValue" @update:model-value="onStatusChange">
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL_VALUE">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="mb-2 block text-xs font-medium text-muted-foreground">View Mode</label>
          <UiViews :model-value="currentView" @update:model-value="emit('update:currentView', $event)" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary">Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem @click="emit('export', 'csv')">CSV</DropdownMenuItem>
            <DropdownMenuItem @click="emit('export', 'json')">JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" @click="emit('share')">Share</Button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-foreground">Active filters:</span>
      <Button v-if="quickSearchQuery" size="sm" variant="secondary" @click="emit('update:quickSearchQuery', '')">
        "{{ quickSearchQuery }}" <X class="ml-1 h-3 w-3" />
      </Button>
      <Button v-if="filterOwner" size="sm" variant="secondary" @click="emit('update:filterOwner', '')">
        {{ getOwnerName(filterOwner) }} <X class="ml-1 h-3 w-3" />
      </Button>
      <Button v-if="filterStatus" size="sm" variant="secondary" @click="emit('update:filterStatus', '')">
        {{ filterStatus }} <X class="ml-1 h-3 w-3" />
      </Button>
      <Button size="sm" variant="destructive" @click="emit('clearAllFilters')">Clear all</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UiViews from "@/ui-table/UiViews.vue";
import type { ViewMode } from "@/ui-table/types/table.types";
import { X } from "lucide-vue-next";
import { computed } from "vue";

const ALL_VALUE = "__all__";

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

const ownerValue = computed(() => props.filterOwner || ALL_VALUE);
const statusValue = computed(() => props.filterStatus || ALL_VALUE);

function onOwnerChange(value: string | number | null) {
  emit("update:filterOwner", !value || value === ALL_VALUE ? "" : String(value));
}

function onStatusChange(value: string | number | null) {
  emit("update:filterStatus", !value || value === ALL_VALUE ? "" : String(value));
}
</script>
