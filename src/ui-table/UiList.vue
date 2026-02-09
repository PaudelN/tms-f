<template>
  <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
    <div class="border-b border-border px-4 py-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-card-foreground">List View</h3>
        <div class="text-xs text-muted-foreground">
          {{ items.length }} items
        </div>
      </div>
    </div>

    <div class="divide-y divide-border">
      <div v-if="loading" class="px-4 py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <Spinner class="h-6 w-6" />
          <p class="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>

      <div v-else-if="items.length === 0" class="px-4 py-12 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <List class="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">No items</p>
            <p class="text-xs text-muted-foreground mt-1">
              Get started by adding your first item
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        v-for="(item, index) in items"
        :key="index"
        class="px-4 py-4 space-y-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-2 flex-1">
            <div
              v-for="column in columns"
              :key="column.key"
              class="flex items-center justify-between gap-3"
            >
              <span class="text-xs text-muted-foreground">
                {{ column.label }}
              </span>
              <span class="text-sm text-card-foreground text-right">
                <slot name="item" :item="item" :column="column" :index="index">
                  {{ column.formatter ? column.formatter(item[column.key], item) : item[column.key] }}
                </slot>
              </span>
            </div>
          </div>
          <div v-if="rowActions?.length" class="flex flex-col gap-2">
            <Button
              v-for="action in rowActions"
              :key="action.label"
              size="sm"
              variant="ghost"
              class="justify-start gap-2"
              @click="$emit('row-action', action, item)"
            >
              <component v-if="action.icon" :is="action.icon" class="h-4 w-4" />
              {{ action.label }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showFooter && items.length > 0" class="border-t border-border px-4 py-3">
      <slot name="footer">
        <div class="text-xs text-muted-foreground text-center">
          End of list
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { List } from "lucide-vue-next";
import type { TableAction, TableColumn } from "./types/table.types";

interface Props {
  items: any[];
  columns: TableColumn[];
  rowActions?: TableAction[];
  loading?: boolean;
  showFooter?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  showFooter: true,
  rowActions: () => [],
});

defineEmits<{
  "row-action": [action: TableAction, row: any];
}>();
</script>
