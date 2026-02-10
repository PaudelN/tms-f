<script setup lang="ts">
import { computed } from "vue";
import { Search, RefreshCw, Columns3 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TableColumn } from "./types/table.types";

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  columns: TableColumn[];
  showRefresh?: boolean;
  loading?: boolean;
  selectedCount?: number;
  totalRows?: number;
  allSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showRefresh: true,
  loading: false,
  selectedCount: 0,
  totalRows: 0,
  allSelected: false,
});

const emit = defineEmits<{
  "update:search": [value: string];
  refresh: [];
  "toggle-column": [columnKey: string];
  "toggle-all-columns": [visible: boolean];
  "toggle-all-rows": [checked: boolean];
}>();

const hasSelection = computed(() => props.selectedCount > 0);
</script>

<template>
  <div class="flex flex-col gap-3 border-b bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
    <div class="relative w-full md:max-w-sm">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        :model-value="searchValue"
        :placeholder="searchPlaceholder"
        class="pl-9"
        @update:model-value="emit('update:search', String($event))"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button
        v-if="showRefresh"
        variant="outline"
        size="sm"
        :disabled="loading"
        class="gap-2"
        @click="emit('refresh')"
      >
        <RefreshCw :class="['size-4', loading ? 'animate-spin' : '']" />
        Refresh
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="gap-2">
            <Columns3 class="size-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuItem @click="emit('toggle-all-columns', true)">Show all</DropdownMenuItem>
          <DropdownMenuItem @click="emit('toggle-all-columns', false)">Hide all</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem v-for="column in columns" :key="column.key" @click="emit('toggle-column', column.key)">
            <div class="flex w-full items-center justify-between gap-2">
              <span>{{ column.label }}</span>
              <Checkbox :model-value="column.visible !== false" class="pointer-events-none" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        v-if="totalRows > 0"
        variant="outline"
        size="sm"
        class="gap-2"
        @click="emit('toggle-all-rows', !allSelected)"
      >
        <Checkbox :model-value="allSelected" class="pointer-events-none" />
        {{ hasSelection ? `${selectedCount} selected` : 'Select all' }}
      </Button>
    </div>
  </div>
</template>
