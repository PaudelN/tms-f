<template>
  <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col min-h-0 h-full">
    
    <!-- Header -->
    <div class="border-b border-border px-4 py-3 shrink-0">
      <h3 class="text-sm font-semibold text-card-foreground">Kanban View</h3>
    </div>

    <!-- Board area -->
    <div class="p-4 flex-1 min-h-0 overflow-hidden flex flex-col">

      <!-- Loading -->
      <div v-if="loading" class="py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <Spinner class="h-6 w-6" />
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="columns.length === 0" class="py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <LayoutGrid class="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">No columns</p>
            <p class="text-xs text-muted-foreground mt-1">Add columns to get started</p>
          </div>
        </div>
      </div>

      <!-- Columns -->
      <div v-else class="flex gap-4 overflow-x-auto flex-1 min-h-0 pb-2">
        <div
          v-for="column in columns"
          :key="column.id"
          class="flex-shrink-0 w-72 flex flex-col min-h-0"
        >
          <!-- Column header -->
          <div class="bg-muted rounded-t-lg px-3 py-2 border border-border shrink-0">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-foreground">{{ column.title }}</h4>
              <span class="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {{ column.items?.length || 0 }}
              </span>
            </div>
          </div>

          <!-- Column items — this is the scroll zone -->
          <div class="bg-muted rounded-b-lg border-x border-b border-border p-2 space-y-2 overflow-y-auto flex-1 min-h-[200px]">
            <slot name="item" :column="column" :items="column.items || []">
              <div
                v-for="(item, index) in column.items"
                :key="index"
                class="bg-card rounded-lg p-3 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div class="text-sm text-foreground">{{ item.title || item }}</div>
              </div>
            </slot>

            <div v-if="!column.items || column.items.length === 0" class="text-center py-8">
              <p class="text-xs text-muted-foreground">No items</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { LayoutGrid } from "lucide-vue-next";

interface KanbanColumn {
  id: string | number;
  title: string;
  items?: any[];
}

interface Props {
  columns: KanbanColumn[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});
</script>