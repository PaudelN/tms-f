<template>
  <div class="bg-card border-border border-b px-5 py-4 rounded-lg shadow-soft">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-start lg:gap-4">
        <div class="relative w-full max-w-md">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            :value="searchValue"
            @input="handleSearchInput"
            :placeholder="searchPlaceholder"
            class="h-10 w-full pl-9"
          />
        </div>

        <div v-if="selectedCount > 0" class="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" class="rounded-full">
            {{ selectedCount }} selected
          </Badge>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              v-for="action in bulkActions"
              :key="action.label"
              :variant="action.variant || 'outline'"
              size="sm"
              :disabled="action.disabled ?? false"
              @click="action.onClick"
            >
              <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
              {{ action.label }}
            </Button>
            <Button variant="ghost" size="sm" @click="$emit('clear-selection')">
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button
          v-if="showRefresh"
          @click="$emit('refresh')"
          :disabled="loading"
          variant="outline"
          size="sm"
          title="Refresh"
        >
          <RefreshCw :class="['h-4 w-4', loading && 'animate-spin']" />
          <span class="hidden sm:inline">Refresh</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" title="Show/hide columns">
              <Columns3 class="h-4 w-4" />
              <span class="hidden sm:inline">Columns</span>
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
import type { TableColumn } from "./types/table.types";
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

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  columns: TableColumn[];
  showRefresh?: boolean;
  loading?: boolean;
  selectedCount?: number;
  bulkActions?: Array<{
    label: string;
    icon?: any;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "ghost";
    disabled?: boolean;
  }>;
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
  "clear-selection": [];
}>();

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:search", target.value);
}

</script>
