<script setup lang="ts">
import { computed } from "vue";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Inbox, TriangleAlert } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortState, TableColumn } from "./types/table.types";

interface RowAction<T = any> {
  label: string;
  onClick: (row: T) => void;
  destructive?: boolean;
}

interface Props {
  data: any[];
  visibleColumns: TableColumn[];
  loading: boolean;
  error: string | null;
  sort: SortState;
  rowKey: string;
  selectedRows: Set<string | number>;
  rowActions?: RowAction[];
}

const props = withDefaults(defineProps<Props>(), {
  rowActions: () => [],
});

const emit = defineEmits<{
  sort: [columnKey: string];
  refresh: [];
  "toggle-row": [rowId: string | number, checked: boolean];
}>();

const hasActions = computed(() => props.rowActions.length > 0);

const getRowId = (row: Record<string, any>) => row[props.rowKey] as string | number;
</script>

<template>
  <div class="hidden md:block">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12" />
          <TableHead
            v-for="column in visibleColumns"
            :key="column.key"
            :class="column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'"
          >
            <Button
              v-if="column.sortable !== false"
              variant="ghost"
              size="sm"
              class="h-8 gap-1 px-1"
              @click="emit('sort', column.key)"
            >
              {{ column.label }}
              <ArrowUp v-if="sort.column === column.key && sort.order === 'asc'" class="size-3.5" />
              <ArrowDown v-else-if="sort.column === column.key && sort.order === 'desc'" class="size-3.5" />
              <ArrowUpDown v-else class="size-3.5" />
            </Button>
            <span v-else class="px-1">{{ column.label }}</span>
          </TableHead>
          <TableHead v-if="hasActions" class="w-12 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="row in 6" :key="row">
            <TableCell><Skeleton class="h-4 w-4" /></TableCell>
            <TableCell v-for="column in visibleColumns" :key="column.key"><Skeleton class="h-4 w-full" /></TableCell>
            <TableCell v-if="hasActions"><Skeleton class="ml-auto h-6 w-6" /></TableCell>
          </TableRow>
        </template>

        <TableRow v-else-if="error">
          <TableCell :colspan="visibleColumns.length + (hasActions ? 2 : 1)" class="py-10">
            <Empty>
              <EmptyHeader>
                <TriangleAlert class="mx-auto size-8 text-destructive" />
                <EmptyTitle>Unable to load rows</EmptyTitle>
                <EmptyDescription>{{ error }}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" variant="outline" @click="emit('refresh')">Try again</Button>
              </EmptyContent>
            </Empty>
          </TableCell>
        </TableRow>

        <TableRow v-else-if="!data.length">
          <TableCell :colspan="visibleColumns.length + (hasActions ? 2 : 1)" class="py-12">
            <Empty>
              <EmptyHeader>
                <Inbox class="mx-auto size-8 text-muted-foreground" />
                <EmptyTitle>No rows found</EmptyTitle>
                <EmptyDescription>Adjust filters or create a new item.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TableCell>
        </TableRow>

        <TableRow v-for="row in data" v-else :key="getRowId(row)">
          <TableCell>
            <Checkbox
              :model-value="selectedRows.has(getRowId(row))"
              @update:model-value="emit('toggle-row', getRowId(row), Boolean($event))"
            />
          </TableCell>
          <TableCell
            v-for="column in visibleColumns"
            :key="column.key"
            :class="column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :column="column">
              {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
            </slot>
          </TableCell>
          <TableCell v-if="hasActions" class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="size-8">
                  <MoreHorizontal class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  v-for="action in rowActions"
                  :key="action.label"
                  :class="action.destructive ? 'text-destructive focus:text-destructive' : ''"
                  @click="action.onClick(row)"
                >
                  {{ action.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <div class="divide-y md:hidden">
    <div v-if="loading" class="space-y-3 p-4">
      <Skeleton v-for="idx in 4" :key="idx" class="h-24 w-full" />
    </div>
    <div v-else-if="!error && data.length" class="space-y-2 p-3">
      <article v-for="row in data" :key="getRowId(row)" class="rounded-lg border bg-card p-3">
        <div class="mb-3 flex items-start justify-between">
          <Checkbox
            :model-value="selectedRows.has(getRowId(row))"
            @update:model-value="emit('toggle-row', getRowId(row), Boolean($event))"
          />
          <DropdownMenu v-if="hasActions">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontal class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                v-for="action in rowActions"
                :key="action.label"
                :class="action.destructive ? 'text-destructive focus:text-destructive' : ''"
                @click="action.onClick(row)"
              >
                {{ action.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <dl class="space-y-2 text-sm">
          <div v-for="column in visibleColumns" :key="column.key" class="flex items-start justify-between gap-3">
            <dt class="text-muted-foreground">{{ column.label }}</dt>
            <dd class="text-right font-medium text-foreground">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :column="column">
                {{ column.formatter ? column.formatter(row[column.key], row) : row[column.key] }}
              </slot>
            </dd>
          </div>
        </dl>
      </article>
    </div>
  </div>
</template>
