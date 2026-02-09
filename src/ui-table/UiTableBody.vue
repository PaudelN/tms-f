<template>
  <div class="rounded-md border border-border">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow>
            <TableCell :colspan="columnsLength" class="h-24 text-center">
              <div class="flex flex-col items-center gap-3">
                <Spinner class="h-6 w-6" />
                <span class="text-sm text-muted-foreground">Loading data...</span>
              </div>
            </TableCell>
          </TableRow>
        </template>

        <template v-else-if="error">
          <TableRow>
            <TableCell :colspan="columnsLength" class="h-24 text-center">
              <div class="flex flex-col items-center gap-2">
                <AlertTriangle class="h-5 w-5 text-destructive" />
                <span class="text-sm text-muted-foreground">{{ error }}</span>
                <Button variant="ghost" size="sm" @click="$emit('refresh')">Try again</Button>
              </div>
            </TableCell>
          </TableRow>
        </template>

        <template v-else-if="!table.getRowModel().rows?.length">
          <TableRow>
            <TableCell :colspan="columnsLength" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>

        <template v-else>
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <TableRow :data-state="row.getIsSelected() && 'selected'">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
            <TableRow v-if="row.getIsExpanded()">
              <TableCell :colspan="row.getAllCells().length">
                <slot name="expanded-row" :row="row.original">
                  {{ JSON.stringify(row.original) }}
                </slot>
              </TableCell>
            </TableRow>
          </template>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
import type { Table } from "@tanstack/vue-table";
import { FlexRender } from "@tanstack/vue-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { AlertTriangle } from "lucide-vue-next";

interface Props {
  table: Table<any>;
  loading: boolean;
  error: string | null;
  columnsLength: number;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
}>();
</script>
