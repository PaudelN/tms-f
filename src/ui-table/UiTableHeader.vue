<template>
  <div class="bg-card border-border border-b px-5 py-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div v-if="showSearch" class="flex-1 min-w-[220px]">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            :value="searchValue"
            @input="handleSearchInput"
            :placeholder="searchPlaceholder"
            class="block w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border-input bg-background text-foreground placeholder-muted-foreground focus:ring-ring focus:ring-2 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div v-if="selectedRows.length" class="flex items-center gap-2">
          <Badge variant="secondary" class="text-xs">
            {{ selectedRows.length }} selected
          </Badge>
          <DropdownMenu v-if="bulkActions.length">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="gap-2">
                <Layers class="h-4 w-4" />
                Bulk actions
              </Button>
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
          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="$emit('clear-selection')"
          >
            Clear
          </Button>
        </div>

        <Button
          v-if="showRefresh"
          @click="$emit('refresh')"
          :disabled="loading"
          variant="outline"
          size="sm"
          class="gap-2"
          title="Refresh"
        >
          <RefreshCcw :class="['h-4 w-4', loading && 'animate-spin']" />
          <span>Refresh</span>
        </Button>

        <DropdownMenu v-if="showColumnToggle">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2">
              <Columns2 class="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="column in columns"
              :key="column.key"
              :checked="column.visible"
              @update:checked="$emit('toggle-column', column.key)"
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Columns2, Layers, RefreshCcw, Search } from "lucide-vue-next";
import type { BulkAction, TableColumn } from "./types/table.types";

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  columns: TableColumn[];
  showSearch?: boolean;
  showColumnToggle?: boolean;
  showRefresh?: boolean;
  loading?: boolean;
  bulkActions?: BulkAction[];
  selectedRows?: any[];
}

withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showSearch: true,
  showColumnToggle: true,
  showRefresh: true,
  loading: false,
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
