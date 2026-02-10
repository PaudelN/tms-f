<template>
  <div class="border-b border-border px-4 py-3">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="relative w-full md:max-w-sm">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          :model-value="searchValue"
          :placeholder="searchPlaceholder"
          class="pl-9"
          @update:model-value="emit('update:search', String($event))"
        />
      </div>

      <div class="flex items-center gap-2">
        <Button v-if="showRefresh" variant="outline" size="sm" :disabled="loading" @click="emit('refresh')">
          <RefreshCcw :class="['mr-1 size-4', loading ? 'animate-spin' : '']" /> Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm">
              <Columns3 class="mr-1 size-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Columns3, RefreshCcw, Search } from "lucide-vue-next";
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
