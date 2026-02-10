<template>
  <div class="border-b border-border p-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input :model-value="searchValue" @update:model-value="emit('update:search', String($event ?? ''))" :placeholder="searchPlaceholder" class="pl-9" />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-for="action in bulkActions"
          v-show="selectedCount > 0"
          :key="action.label"
          size="sm"
          :variant="action.variant ?? 'outline'"
                    @click="emit('bulk-action', action)"
        >
          {{ action.label }} ({{ selectedCount }})
        </Button>

        <Button v-if="selectedCount > 0" size="sm" variant="ghost" @click="emit('clear-selection')">Clear</Button>

        <Button v-if="showRefresh" size="sm" variant="outline" :disabled="loading" @click="emit('refresh')">
          <RefreshCw :class="['mr-2 h-4 w-4', loading && 'animate-spin']" /> Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button size="sm" variant="outline"><Columns3 class="mr-2 h-4 w-4" />Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-52">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in columns"
              :key="column.key"
              :checked="column.visible !== false"
              @update:checked="emit('toggle-column', column.key)"
            >
              {{ column.label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Columns3, RefreshCw, Search } from "lucide-vue-next";
import type { BulkAction, TableColumn } from "./types/table.types";

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  columns: TableColumn[];
  showRefresh?: boolean;
  loading?: boolean;
  selectedCount?: number;
  bulkActions?: BulkAction[];
}

withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showRefresh: true,
  loading: false,
  selectedCount: 0,
  bulkActions: () => [],
});


const emit = defineEmits<{
  "update:search": [value: string];
  refresh: [];
  "toggle-column": [columnKey: string];
  "bulk-action": [action: BulkAction];
  "clear-selection": [];
}>();
</script>
