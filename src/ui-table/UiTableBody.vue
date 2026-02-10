<template>
  <div class="overflow-x-auto rounded-lg shadow-soft border-border border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-if="selection.enabled" class="w-10">
            <Checkbox
              :checked="selectionCheckboxState"
              @update:checked="(checked) => $emit('toggle-all', Boolean(checked))"
            />
          </TableHead>
          <TableHead
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              'text-xs font-semibold uppercase tracking-wider select-none transition-colors',
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left',
              column.sortable !== false ? 'cursor-pointer hover:bg-muted/70' : '',
              column.headerClass,
            ]"
            @click="column.sortable !== false && $emit('sort', column.key)"
          >
            <div
              class="flex items-center gap-2"
              :class="
                column.align === 'center'
                  ? 'justify-center'
                  : column.align === 'right'
                    ? 'justify-end'
                    : 'justify-start'
              "
            >
              <span>{{ column.label }}</span>
              <span v-if="column.sortable !== false" class="flex items-center">
                <ArrowUp
                  v-if="sort.column === column.key && sort.order === 'asc'"
                  class="h-3 w-3 text-primary"
                />
                <ArrowDown
                  v-else-if="sort.column === column.key && sort.order === 'desc'"
                  class="h-3 w-3 text-primary"
                />
                <ArrowUpDown v-else class="h-3 w-3 text-muted-foreground" />
              </span>
            </div>
          </TableHead>
          <TableHead v-if="rowActions.length" class="text-right text-xs">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody class="bg-background text-foreground">
        <TableRow v-if="loading">
          <TableCell
            :colspan="visibleColumns.length + selectionColspan + actionsColspan"
            class="py-12"
          >
            <div class="flex flex-col items-center gap-3">
              <Spinner class="h-6 w-6" />
              <p class="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="error">
          <TableCell
            :colspan="visibleColumns.length + selectionColspan + actionsColspan"
            class="py-12"
          >
            <div class="flex flex-col items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle class="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p class="text-sm font-medium text-card-foreground">
                  Error loading data
                </p>
                <p class="text-xs text-muted-foreground mt-1">{{ error }}</p>
              </div>
              <Button variant="ghost" size="sm" @click="$emit('refresh')">
                Try again
              </Button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="data.length === 0">
          <TableCell
            :colspan="visibleColumns.length + selectionColspan + actionsColspan"
            class="py-12"
          >
            <div class="flex flex-col items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Inbox class="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm font-medium text-card-foreground">No data found</p>
                <p class="text-xs text-muted-foreground mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          </TableCell>
        </TableRow>

        <TableRow
          v-else
          v-for="(row, index) in data"
          :key="index"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell v-if="selection.enabled" class="align-middle">
            <Checkbox
              :checked="selection.isRowSelected(row)"
              @update:checked="(checked) => $emit('toggle-row', row, Boolean(checked))"
            />
          </TableCell>
          <TableCell
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              'text-sm',
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left',
              typeof column.cellClass === 'function'
                ? column.cellClass(row)
                : column.cellClass,
              'text-card-foreground',
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
          <TableCell v-if="rowActions.length" class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  v-for="action in visibleRowActions(row)"
                  :key="action.label"
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
import { computed } from "vue";
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
import Spinner from "@/components/ui/spinner/Spinner.vue";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Inbox,
  MoreHorizontal,
} from "lucide-vue-next";
import type { TableAction, TableColumn, SortState } from "./types/table.types";

interface SelectionState {
  enabled: boolean;
  allSelected: boolean;
  someSelected: boolean;
  isRowSelected: (row: any) => boolean;
}

interface Props {
  data: any[];
  visibleColumns: TableColumn[];
  loading: boolean;
  error: string | null;
  sort: SortState;
  rowActions?: TableAction[];
  selection?: SelectionState;
}

const props = withDefaults(defineProps<Props>(), {
  rowActions: () => [],
  selection: () => ({
    enabled: false,
    allSelected: false,
    someSelected: false,
    isRowSelected: () => false,
  }),
});

defineEmits<{
  sort: [columnKey: string];
  refresh: [];
  "toggle-row": [row: any, checked: boolean];
  "toggle-all": [checked: boolean];
}>();

const rowActions = computed(() => props.rowActions || []);

const selectionColspan = computed(() => (props.selection.enabled ? 1 : 0));
const actionsColspan = computed(() => (rowActions.value.length ? 1 : 0));

const selectionCheckboxState = computed(() => {
  if (props.selection.allSelected) return true;
  if (props.selection.someSelected) return "indeterminate";
  return false;
});

function visibleRowActions(row: Record<string, any>) {
  return rowActions.value.filter((action) =>
    action.show ? action.show(row) : true,
  );
}
</script>
