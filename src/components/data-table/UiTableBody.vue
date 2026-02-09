<template>
  <div class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-if="selectable" class="w-10">
            <Checkbox
              :checked="allSelected ? true : someSelected ? 'indeterminate' : false"
              @update:checked="$emit('toggle-all')"
              aria-label="Select all rows"
            />
          </TableHead>
          <TableHead
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left',
              column.headerClass,
              column.sortable !== false ? 'cursor-pointer select-none' : '',
            ]"
            @click="column.sortable !== false && $emit('sort', column.key)"
          >
            <div
              class="flex items-center gap-2"
              :class="column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'"
            >
              <span>{{ column.label }}</span>
              <ArrowUpDown
                v-if="column.sortable !== false"
                class="h-3 w-3"
                :class="sort.column === column.key ? 'text-primary' : 'text-muted-foreground'"
              />
            </div>
          </TableHead>
          <TableHead v-if="hasRowActions" class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-if="loading">
          <TableCell :colspan="columnCount" class="py-10 text-center">
            <div class="flex flex-col items-center gap-3">
              <Loader2 class="h-6 w-6 animate-spin text-primary" />
              <p class="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="error">
          <TableCell :colspan="columnCount" class="py-10 text-center">
            <div class="flex flex-col items-center gap-3">
              <AlertTriangle class="h-6 w-6 text-destructive" />
              <div>
                <p class="text-sm font-medium text-foreground">Error loading data</p>
                <p class="text-xs text-muted-foreground mt-1">{{ error }}</p>
              </div>
              <Button variant="outline" size="sm" @click="$emit('refresh')">Try again</Button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="data.length === 0">
          <TableCell :colspan="columnCount" class="py-10 text-center">
            <div class="flex flex-col items-center gap-3">
              <Inbox class="h-6 w-6 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium text-foreground">No data found</p>
                <p class="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
              </div>
            </div>
          </TableCell>
        </TableRow>

        <TableRow
          v-for="(row, index) in data"
          v-else
          :key="row[rowKey] ?? index"
          class="hover:bg-muted/50"
        >
          <TableCell v-if="selectable" class="w-10">
            <Checkbox
              :checked="selectedRowIds.has(row[rowKey])"
              @update:checked="$emit('toggle-row', row)"
              aria-label="Select row"
            />
          </TableCell>
          <TableCell
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left',
              typeof column.cellClass === 'function' ? column.cellClass(row) : column.cellClass,
            ]"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
              :column="column"
            >
              {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
            </slot>
          </TableCell>
          <TableCell v-if="hasRowActions" class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <DropdownMenuItem
                  v-for="action in rowActions"
                  :key="action.label"
                  v-show="action.show ? action.show(row) : true"
                  :class="action.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''"
                  @click="action.onClick(row)"
                >
                  <component v-if="action.icon" :is="action.icon" class="mr-2 h-4 w-4" />
                  {{ action.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowUpDown,
  Inbox,
  Loader2,
  MoreHorizontal,
} from "lucide-vue-next";
import { computed } from "vue";
import type { SortState, TableAction, TableColumn } from "./types/table.types";

interface Props {
  data: any[];
  visibleColumns: TableColumn[];
  loading: boolean;
  error: string | null;
  sort: SortState;
  selectable?: boolean;
  rowKey?: string;
  selectedRowIds?: Set<string | number>;
  rowActions?: TableAction[];
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  rowKey: "id",
  selectedRowIds: () => new Set(),
  rowActions: () => [],
});

const hasRowActions = computed(() => props.rowActions.length > 0);
const columnCount = computed(() => props.visibleColumns.length + (props.selectable ? 1 : 0) + (hasRowActions.value ? 1 : 0));
const allSelected = computed(() => props.data.length > 0 && props.selectedRowIds.size === props.data.length);
const someSelected = computed(() => props.selectedRowIds.size > 0 && props.selectedRowIds.size < props.data.length);

defineEmits<{
  sort: [columnKey: string];
  refresh: [];
  "toggle-row": [row: any];
  "toggle-all": [];
}>();
</script>
