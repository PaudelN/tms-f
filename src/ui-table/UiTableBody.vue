<template>
  <div class="overflow-x-auto rounded-lg border border-border">
    <Table>
      <TableHeader class="bg-card">
        <TableRow>
          <TableHead class="w-12">
            <Checkbox
              :checked="allSelected"
              @update:checked="toggleAllRows"
              aria-label="Select all rows"
            />
          </TableHead>
          <TableHead
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              'text-xs font-semibold uppercase tracking-wider',
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left',
              column.sortable !== false ? 'cursor-pointer select-none' : '',
              column.headerClass || '',
              column.widthClass || '',
            ]"
            @click="column.sortable !== false && $emit('sort', column.key)"
          >
            <div
              class="flex items-center gap-2"
              :class="column.align === 'center'
                ? 'justify-center'
                : column.align === 'right'
                  ? 'justify-end'
                  : 'justify-start'"
            >
              <span>{{ column.label }}</span>
              <span v-if="column.sortable !== false" class="flex">
                <ChevronUp
                  v-if="sort.column === column.key && sort.order === 'asc'"
                  class="h-3 w-3 text-primary"
                />
                <ChevronDown
                  v-else-if="sort.column === column.key && sort.order === 'desc'"
                  class="h-3 w-3 text-primary"
                />
                <ChevronsUpDown
                  v-else
                  class="h-3 w-3 text-muted-foreground"
                />
              </span>
            </div>
          </TableHead>
          <TableHead v-if="rowActions.length" class="w-12 text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody class="bg-background text-foreground">
        <TableRow v-if="loading">
          <TableCell :colspan="visibleColumns.length + actionOffset" class="py-12 text-center">
            <div class="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 class="h-8 w-8 animate-spin text-primary" />
              <p class="text-sm">Loading data...</p>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="error">
          <TableCell :colspan="visibleColumns.length + actionOffset" class="py-12 text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle class="h-6 w-6" />
              </div>
              <div>
                <p class="text-sm font-medium text-card-foreground">Error loading data</p>
                <p class="text-xs text-muted-foreground mt-1">{{ error }}</p>
              </div>
              <Button variant="ghost" size="sm" @click="$emit('refresh')">
                Try again
              </Button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="data.length === 0">
          <TableCell :colspan="visibleColumns.length + actionOffset" class="py-12 text-center">
            <div class="flex flex-col items-center gap-3 text-muted-foreground">
              <Inbox class="h-8 w-8" />
              <div>
                <p class="text-sm font-medium text-card-foreground">No data found</p>
                <p class="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
              </div>
            </div>
          </TableCell>
        </TableRow>

        <TableRow
          v-else
          v-for="row in data"
          :key="getRowId(row)"
          class="transition-colors hover:bg-muted/50"
        >
          <TableCell class="w-12">
            <Checkbox
              :checked="selectedRowIds.includes(getRowId(row))"
              @update:checked="$emit('toggle-row', getRowId(row))"
              aria-label="Select row"
            />
          </TableCell>
          <TableCell
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[
              'text-sm text-card-foreground',
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left',
              typeof column.cellClass === 'function' ? column.cellClass(row) : column.cellClass || '',
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
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44">
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
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Inbox,
  Loader2,
  MoreHorizontal,
} from "lucide-vue-next";
import type { TableAction, TableColumn, SortState } from "./types/table.types";

interface Props {
  data: any[]
  visibleColumns: TableColumn[]
  loading: boolean
  error: string | null
  sort: SortState
  rowActions?: TableAction[]
  rowIdKey: string
  selectedRowIds: Array<string | number>
}

const props = withDefaults(defineProps<Props>(), {
  rowActions: () => [],
})

const emit = defineEmits<{
  sort: [columnKey: string]
  refresh: []
  'toggle-row': [rowId: string | number]
  'toggle-all': [rowIds: Array<string | number>]
}>()

const actionOffset = computed(() => (props.rowActions?.length ? 2 : 1))

const allSelected = computed(() => {
  if (!props.data.length) return false
  const allIds = props.data.map((row) => getRowId(row))
  return allIds.every((id) => props.selectedRowIds.includes(id))
})

const getRowId = (row: Record<string, any>) => row?.[props.rowIdKey]

const visibleRowActions = (row: Record<string, any>) =>
  props.rowActions.filter((action) => action.show?.(row) ?? true)

const toggleAllRows = (checked: boolean) => {
  if (!props.data.length) return
  const allIds = props.data.map((row) => getRowId(row))
  if (checked) {
    return emit("toggle-all", allIds)
  }
  emit("toggle-all", [])
}
</script>
