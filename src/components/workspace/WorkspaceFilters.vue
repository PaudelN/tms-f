<template>
  <div class="bg-card rounded-xl shadow-sm border border-border p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-xs font-medium text-muted-foreground mb-2">Filter by Owner</label>
        <Select :model-value="filterOwner" @update:model-value="emit('update:filterOwner', $event)">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="All Owners" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Owners</SelectItem>
            <SelectItem v-for="owner in uniqueOwners" :key="owner.id" :value="String(owner.id)">
              {{ owner.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label class="block text-xs font-medium text-muted-foreground mb-2">Filter by Status</label>
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
          <label class="block text-xs font-medium text-muted-foreground mb-2">View Mode</label>
          <UiViews :model-value="currentView" @update:model-value="emit('update:currentView', $event)" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" class="whitespace-nowrap">
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem @click="emit('export', 'csv')">CSV</DropdownMenuItem>
            <DropdownMenuItem @click="emit('export', 'json')">JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="secondary" class="whitespace-nowrap" @click="emit('share')">
          Share
        </Button>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 flex-wrap">
      <span class="text-xs text-muted-foreground">Active filters:</span>
      <Button
        v-if="quickSearchQuery"
        type="button"
        variant="secondary"
        size="sm"
        class="gap-1.5 text-primary"
        @click="emit('update:quickSearchQuery', '')"
      >
        <span>"{{ quickSearchQuery }}"</span>
        <X class="w-3 h-3" />
      </Button>
      <Button
        v-if="filterOwner"
        type="button"
        variant="secondary"
        size="sm"
        class="gap-1.5 text-primary"
        @click="emit('update:filterOwner', '')"
      >
        <span>{{ getOwnerName(filterOwner) }}</span>
        <X class="w-3 h-3" />
      </Button>
      <Button
        v-if="filterStatus"
        type="button"
        variant="secondary"
        size="sm"
        class="gap-1.5 text-primary"
        @click="emit('update:filterStatus', '')"
      >
        <span>{{ filterStatus }}</span>
        <X class="w-3 h-3" />
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        class="gap-1.5"
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
import { X } from "lucide-vue-next";
import type { ViewMode } from "@/ui-table/types/table.types";
import UiViews from "@/ui-table/UiViews.vue";

type Owner = {
  id: number;
  name: string;
};

defineProps<{
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
