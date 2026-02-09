<template>
  <div class="mb-6">
    <div class="bg-card rounded-lg shadow-sm border border-border p-1">
      <div class="flex items-center gap-1">
        <Button
          v-for="view in views"
          :key="view.value"
          @click="$emit('update:modelValue', view.value)"
          :variant="modelValue === view.value ? 'default' : 'ghost'"
          class="flex-1 gap-2"
          size="sm"
        >
          <component :is="view.icon" class="h-4 w-4" />
          <span>{{ view.label }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViewMode } from './types/table.types'
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Columns3 } from "lucide-vue-next";

interface ViewOption {
  value: ViewMode
  label: string
  icon: any
}

interface Props {
  modelValue: ViewMode
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: ViewMode]
}>()

const views: ViewOption[] = [
  { value: 'table', label: 'Table', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
  { value: 'kanban', label: 'Kanban', icon: Columns3 }
]
</script>
