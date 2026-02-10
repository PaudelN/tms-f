<template>
  <div>
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full table-auto border-collapse">
        <thead class="bg-muted/30">
          <tr>
            <th class="w-10 px-3 py-3">
              <Checkbox :checked="allSelected" @update:checked="emit('toggle-all')" />
            </th>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              @click="column.sortable !== false && emit('sort', column.key)"
            >
              <div class="flex items-center gap-1" :class="column.sortable !== false ? 'cursor-pointer' : ''">
                <span>{{ column.label }}</span>
                <ArrowUpDown v-if="column.sortable !== false" class="size-3" />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="visibleColumns.length + 1" class="px-4 py-8 text-center text-sm text-muted-foreground">Loading data...</td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="visibleColumns.length + 1" class="px-4 py-8 text-center text-sm text-destructive">{{ error }}</td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="visibleColumns.length + 1" class="px-4 py-8 text-center text-sm text-muted-foreground">No data found.</td>
          </tr>
          <tr v-for="(row, index) in data" v-else :key="index" class="border-t hover:bg-muted/20">
            <td class="px-3 py-3">
              <Checkbox :checked="isRowSelected(index)" @update:checked="emit('toggle-row', index)" />
            </td>
            <td v-for="column in visibleColumns" :key="column.key" class="px-4 py-3 text-sm text-foreground">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :column="column">
                {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-2 p-3 md:hidden">
      <div v-for="(row, index) in data" :key="index" class="rounded-lg border bg-card p-3">
        <div class="mb-2 flex items-center justify-between">
          <Checkbox :checked="isRowSelected(index)" @update:checked="emit('toggle-row', index)" />
        </div>
        <div v-for="column in visibleColumns" :key="column.key" class="flex items-center justify-between gap-2 py-1">
          <span class="text-xs text-muted-foreground">{{ column.label }}</span>
          <div class="text-sm text-foreground">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :column="column">
              {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
            </slot>
          </div>
        </div>
      </div>
      <p v-if="!loading && !error && data.length === 0" class="py-6 text-center text-sm text-muted-foreground">No data found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-vue-next";
import { computed } from "vue";
import type { SortState, TableColumn } from "./types/table.types";

interface Props {
  data: any[];
  visibleColumns: TableColumn[];
  loading: boolean;
  error: string | null;
  sort: SortState;
  selectedRows: number[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  sort: [columnKey: string];
  refresh: [];
  "toggle-row": [index: number];
  "toggle-all": [];
}>();

const isRowSelected = (index: number) => props.selectedRows.includes(index);
const allSelected = computed(
  () => props.data.length > 0 && props.selectedRows.length === props.data.length,
);
</script>
