<script setup lang="ts">
import { X, Share2, Download } from "lucide-vue-next";
import type { ViewMode } from "@/ui-table/types/table.types";
import UiViews from "@/ui-table/UiViews.vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ALL = "__all__";

type Owner = { id: number; name: string };

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

<template>
  <div class="space-y-3 rounded-xl border bg-card p-4">
    <div class="grid gap-3 md:grid-cols-3">
      <div class="space-y-2">
        <label class="text-xs font-medium text-muted-foreground">Filter by Owner</label>
        <Select :model-value="filterOwner || ALL" @update:model-value="emit('update:filterOwner', $event === ALL ? '' : String($event))">
          <SelectTrigger><SelectValue placeholder="All Owners" /></SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL">All Owners</SelectItem>
            <SelectItem v-for="owner in uniqueOwners" :key="owner.id" :value="String(owner.id)">{{ owner.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-muted-foreground">Filter by Status</label>
        <Select :model-value="filterStatus || ALL" @update:model-value="emit('update:filterStatus', $event === ALL ? '' : String($event))">
          <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem :value="ALL">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-medium text-muted-foreground">View Mode</label>
        <div class="flex items-center gap-2">
          <UiViews :model-value="currentView" @update:model-value="emit('update:currentView', $event)" />

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="gap-1"><Download class="size-4" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="emit('export', 'csv')">CSV</DropdownMenuItem>
              <DropdownMenuItem @click="emit('export', 'json')">JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" class="gap-1" @click="emit('share')">
            <Share2 class="size-4" />Share
          </Button>
        </div>
      </div>
    </div>

    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-foreground">Active filters:</span>
      <Badge v-if="quickSearchQuery" variant="secondary" class="gap-1">{{ quickSearchQuery }}<X class="size-3 cursor-pointer" @click="emit('update:quickSearchQuery', '')" /></Badge>
      <Badge v-if="filterOwner" variant="secondary" class="gap-1">{{ getOwnerName(filterOwner) }}<X class="size-3 cursor-pointer" @click="emit('update:filterOwner', '')" /></Badge>
      <Badge v-if="filterStatus" variant="secondary" class="gap-1">{{ filterStatus }}<X class="size-3 cursor-pointer" @click="emit('update:filterStatus', '')" /></Badge>
      <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="emit('clearAllFilters')">Clear all</Button>
    </div>
  </div>
</template>
