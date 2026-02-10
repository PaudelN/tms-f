<template>
  <div class="flex flex-col gap-3 border-b bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="relative w-full sm:max-w-sm">
      <Search class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        :model-value="searchValue"
        :placeholder="searchPlaceholder"
        class="h-9 pl-8"
        @update:model-value="emit('update:search', String($event ?? ''))"
      />
    </div>

    <div class="flex items-center gap-2 self-end sm:self-auto">
      <Button v-if="showRefresh" variant="outline" size="sm" :disabled="loading" @click="emit('refresh')">
        <RefreshCw :class="['mr-1 size-4', loading && 'animate-spin']" />
        Refresh
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm">
            <Columns3 class="mr-1 size-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            v-for="column in columns"
            :key="column.key"
            :model-value="column.visible !== false"
            @update:model-value="emit('toggle-column', column.key)"
          >
            {{ column.label }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
import type { TableColumn } from "./types/table.types";

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  columns: TableColumn[];
  showRefresh?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  searchPlaceholder: "Search...",
  showRefresh: true,
  loading: false,
});

const emit = defineEmits<{
  "update:search": [value: string];
  refresh: [];
  "toggle-column": [columnKey: string];
}>();
</script>
