<template>
  <div>
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead class="bg-muted/40">
          <tr>
            <th class="w-12 px-3 py-2">
              <Checkbox :checked="allSelected" @update:checked="emit('toggle-all', dataRowIds)" />
            </th>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              @click="column.sortable !== false && emit('sort', column.key)"
            >
              <div class="flex items-center gap-1" :class="column.sortable !== false ? 'cursor-pointer' : ''">
                {{ column.label }}
                <ArrowUpDown v-if="column.sortable !== false" class="h-3 w-3" />
              </div>
            </th>
            <th v-if="rowActions.length" class="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="visibleColumns.length + 2" class="p-8 text-center text-sm text-muted-foreground">Loading...</td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="visibleColumns.length + 2" class="p-8 text-center">
              <p class="text-sm text-destructive">{{ error }}</p>
              <Button variant="ghost" size="sm" class="mt-2" @click="emit('refresh')">Try again</Button>
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="visibleColumns.length + 2" class="p-8 text-center text-sm text-muted-foreground">No records found.</td>
          </tr>

          <tr v-for="(row, index) in data" v-else :key="row?.id ?? index" class="border-t hover:bg-muted/30">
            <td class="px-3 py-3">
              <Checkbox :checked="isSelected(row, index)" @update:checked="emit('toggle-row', getRowId(row, index))" />
            </td>
            <td v-for="column in visibleColumns" :key="column.key" class="px-4 py-3 text-sm text-foreground">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :column="column">
                {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
              </slot>
            </td>
            <td v-if="rowActions.length" class="px-4 py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon"><MoreHorizontal class="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    v-for="action in visibleRowActions(row)"
                    :key="action.label"
                    @click="action.onClick(row)"
                  >
                    {{ action.label }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 p-3 md:hidden">
      <div v-if="loading" class="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">Loading...</div>
      <div v-else-if="error" class="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{{ error }}</div>
      <div v-else-if="data.length === 0" class="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">No records found.</div>

      <div v-for="(row, index) in data" v-else :key="row?.id ?? index" class="rounded-lg border border-border p-4">
        <div class="mb-3 flex items-center justify-between">
          <Checkbox :checked="isSelected(row, index)" @update:checked="emit('toggle-row', getRowId(row, index))" />
          <DropdownMenu v-if="rowActions.length">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon"><MoreHorizontal class="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem v-for="action in visibleRowActions(row)" :key="action.label" @click="action.onClick(row)">
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <dl class="space-y-2">
          <div v-for="column in visibleColumns" :key="column.key" class="grid grid-cols-2 gap-2 text-sm">
            <dt class="text-muted-foreground">{{ column.label }}</dt>
            <dd class="text-right text-foreground">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :column="column">
                {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
              </slot>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-vue-next";
import { computed } from "vue";
import type { SortState, TableAction, TableColumn } from "./types/table.types";

interface Props {
  data: any[];
  visibleColumns: TableColumn[];
  loading: boolean;
  error: string | null;
  sort: SortState;
  selectedRowIds: string[];
  rowActions?: TableAction[];
  mobileBreakpoint?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rowActions: () => [],
  mobileBreakpoint: 768,
});

const emit = defineEmits<{
  sort: [columnKey: string];
  refresh: [];
  "toggle-row": [rowId: string];
  "toggle-all": [rowIds: string[]];
}>();

const dataRowIds = computed(() => props.data.map((row: any, index) => getRowId(row, index)));
const allSelected = computed(() => dataRowIds.value.length > 0 && dataRowIds.value.every((id) => props.selectedRowIds.includes(id)));

function getRowId(row: any, index = 0) {
  return String(row?.id ?? `row-${index}`);
}

function isSelected(row: any, index = 0) {
  return props.selectedRowIds.includes(getRowId(row, index));
}

function visibleRowActions(row: any) {
  return props.rowActions.filter((action) => (action.show ? action.show(row) : true));
}
</script>
