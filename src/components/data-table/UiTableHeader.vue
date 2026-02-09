<template>
  <div class="border-b border-border bg-card px-5 py-4 shadow-soft">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div v-if="showSearch" class="relative w-full max-w-md">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            :value="searchValue"
            @input="handleSearchInput"
            :placeholder="searchPlaceholder"
            class="w-full pl-9"
          />
        </div>

        <div v-if="selectedCount" class="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {{ selectedCount }} selected
          </Badge>
          <Button
            v-for="action in bulkActions"
            :key="action.label"
            size="sm"
            :variant="action.variant || 'outline'"
            :disabled="action.disabled ? action.disabled(selectedRows) : false"
            @click="action.onClick(selectedRows)"
          >
            <component v-if="action.icon" :is="action.icon" class="mr-1 h-4 w-4" />
            {{ action.label }}
          </Button>
          <Button size="sm" variant="ghost" @click="$emit('clear-selection')">Clear</Button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="showRefresh"
          @click="$emit('refresh')"
          :disabled="loading"
          variant="outline"
          class="h-9 gap-2"
        >
          <RefreshCw :class="['h-4 w-4', loading && 'animate-spin']" />
          <span>Refresh</span>
        </Button>

        <DropdownMenu v-if="showColumnToggle">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="h-9 gap-2">
              <Columns3 class="h-4 w-4" />
              <span>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in columns"
              :key="column.key"
              :checked="column.visible"
              @update:checked="() => $emit('toggle-column', column.key)"
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
import { Badge } from "@/components/ui/badge";
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
  showSearch?: boolean;
  showColumnToggle?: boolean;
  loading?: boolean;
  selectedCount?: number;
  bulkActions?: BulkAction[];
  selectedRows?: any[];
}

withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showRefresh: true,
  showSearch: true,
  showColumnToggle: true,
  loading: false,
  selectedCount: 0,
  bulkActions: () => [],
  selectedRows: () => [],
});

const emit = defineEmits<{
  "update:search": [value: string];
  refresh: [];
  "toggle-column": [columnKey: string];
  "clear-selection": [];
}>();

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:search", target.value);
}
</script>
