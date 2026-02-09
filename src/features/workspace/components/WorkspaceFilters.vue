<template>
  <div class="bg-card rounded-xl shadow-sm border border-border p-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label class="mb-2 block text-xs font-medium text-muted-foreground">Filter by Owner</label>
        <Select :model-value="filterOwner" @update:model-value="emit('update:filterOwner', $event)">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="All Owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Owners</SelectItem>
            <SelectItem v-for="owner in uniqueOwners" :key="owner.id" :value="owner.id.toString()">
              {{ owner.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label class="mb-2 block text-xs font-medium text-muted-foreground">Filter by Status</label>
        <Select :model-value="filterStatus" @update:model-value="emit('update:filterStatus', $event)">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
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
            <Button variant="secondary" class="text-sm font-medium">Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem @click="emit('export', 'csv')">CSV</DropdownMenuItem>
            <DropdownMenuItem @click="emit('export', 'json')">JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" class="text-sm font-medium" @click="emit('share')">Share</Button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 flex-wrap">
      <span class="text-xs text-muted-foreground">Active filters:</span>
      <Button
        v-if="quickSearchQuery"
        variant="secondary"
        size="sm"
        class="h-7 gap-1.5 rounded-lg text-xs"
        @click="emit('update:quickSearchQuery', '')"
      >
        <span>\"{{ quickSearchQuery }}\"</span>
        <X class="h-3 w-3" />
      </Button>
      <Button
        v-if="filterOwner"
        variant="secondary"
        size="sm"
        class="h-7 gap-1.5 rounded-lg text-xs"
        @click="emit('update:filterOwner', '')"
      >
        <span>{{ getOwnerName(filterOwner) }}</span>
        <X class="h-3 w-3" />
      </Button>
      <Button
        v-if="filterStatus"
        variant="secondary"
        size="sm"
        class="h-7 gap-1.5 rounded-lg text-xs"
        @click="emit('update:filterStatus', '')"
      >
        <span>{{ filterStatus }}</span>
        <X class="h-3 w-3" />
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        class="h-7 text-xs"
        @click="emit('clearAllFilters')"
      >
        Clear all
      </Button>
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
import type { ViewMode } from "@/components/data-table/types/table.types";
import UiViews from "@/components/data-table/UiViews.vue";
import { X } from "lucide-vue-next";

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
  getOwnerName: (ownerId: string) => string;
}>();

const emit = defineEmits<{
  (e: "update:filterOwner", value: string): void;
  (e: "update:filterStatus", value: string): void;
  (e: "update:currentView", value: ViewMode): void;
  (e: "update:quickSearchQuery", value: string): void;
  (e: "export", value: "csv" | "json"): void;
  (e: "share"): void;
  (e: "clearAllFilters"): void;
}>();
</script>
