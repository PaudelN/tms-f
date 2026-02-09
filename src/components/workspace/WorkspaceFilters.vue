<template>
  <Card>
    <CardContent class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-2">Filter by Owner</label>
          <Select :model-value="filterOwner" @update:model-value="emit('update:filterOwner', $event)">
            <SelectTrigger>
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
          <label class="block text-xs font-medium text-muted-foreground mb-2">Filter by Status</label>
          <Select :model-value="filterStatus" @update:model-value="emit('update:filterStatus', $event)">
            <SelectTrigger>
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

          <div class="relative">
            <Button variant="secondary" size="sm" @click="emit('toggleExportMenu')">
              Export
            </Button>
            <div
              v-if="showExportMenu"
              class="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg py-2 z-50"
            >
              <Button
                variant="ghost"
                size="sm"
                class="w-full justify-start"
                @click="emit('export', 'csv')"
              >
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="w-full justify-start"
                @click="emit('export', 'json')"
              >
                JSON
              </Button>
            </div>
          </div>

          <Button variant="secondary" size="sm" @click="emit('share')">Share</Button>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2 flex-wrap">
        <span class="text-xs text-muted-foreground">Active filters:</span>
        <Badge
          v-if="quickSearchQuery"
          variant="secondary"
          class="gap-2"
        >
          "{{ quickSearchQuery }}"
          <button type="button" @click="emit('update:quickSearchQuery', '')">
            <span class="sr-only">Clear search</span>
            ✕
          </button>
        </Badge>
        <Badge v-if="filterOwner" variant="secondary" class="gap-2">
          {{ getOwnerName(filterOwner) }}
          <button type="button" @click="emit('update:filterOwner', '')">
            <span class="sr-only">Clear owner</span>
            ✕
          </button>
        </Badge>
        <Badge v-if="filterStatus" variant="secondary" class="gap-2">
          {{ filterStatus }}
          <button type="button" @click="emit('update:filterStatus', '')">
            <span class="sr-only">Clear status</span>
            ✕
          </button>
        </Badge>
        <Button variant="ghost" size="sm" class="text-destructive" @click="emit('clearAllFilters')">
          Clear all
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
</script>
