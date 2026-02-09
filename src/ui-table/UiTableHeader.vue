<template>
  <div class="bg-card border-b border-border px-4 py-3">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-[220px]" v-if="showSearch">
        <Input
          class="max-w-sm"
          :placeholder="searchPlaceholder"
          :model-value="searchValue"
          @update:model-value="updateSearch"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div v-if="selectedCount > 0" class="flex items-center gap-2">
          <Badge variant="secondary" class="text-xs">
            {{ selectedCount }} selected
          </Badge>
          <DropdownMenu v-if="bulkActions.length">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm">Bulk actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuLabel>Apply to selected</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="action in bulkActions"
                :key="action.label"
                :disabled="action.disabled?.(selectedRows)"
                @click="action.onClick(selectedRows)"
              >
                <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" @click="$emit('clear-selection')">Clear</Button>
        </div>

        <Button
          v-if="showRefresh"
          variant="outline"
          size="sm"
          class="gap-2"
          :disabled="loading"
          @click="$emit('refresh')"
        >
          <RefreshCcw :class="['h-4 w-4', loading && 'animate-spin']" />
          Refresh
        </Button>

        <DropdownMenu v-if="showColumnToggle">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="ml-auto">
              Columns
              <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in toggleableColumns"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:model-value="column.toggleVisibility(!!$event)"
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Table } from "@tanstack/vue-table";
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, RefreshCcw } from "lucide-vue-next";
import type { BulkAction } from "./types/table.types";

interface Props {
  table: Table<any>;
  searchValue: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showColumnToggle?: boolean;
  showRefresh?: boolean;
  loading?: boolean;
  bulkActions?: BulkAction[];
  selectedCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showSearch: true,
  showColumnToggle: true,
  showRefresh: true,
  loading: false,
  bulkActions: () => [],
  selectedCount: 0,
});

const emit = defineEmits<{
  "update:search": [value: string];
  refresh: [];
  "clear-selection": [];
}>();

const toggleableColumns = computed(() =>
  props.table.getAllColumns().filter((column) => column.getCanHide()),
);

const selectedRows = computed(() =>
  props.table.getFilteredSelectedRowModel().rows.map((row) => row.original),
);

function updateSearch(value: string | number) {
  emit("update:search", String(value));
}
</script>
