<template>
  <div class="mb-6">
    <div class="bg-card rounded-lg shadow-sm border border-border p-1">
      <div class="flex items-center gap-1">
        <Button
          v-for="view in views"
          :key="view.value"
          type="button"
          variant="ghost"
          class="flex-1 gap-2"
          :class="modelValue === view.value ? 'bg-primary text-primary-foreground' : ''"
          @click="$emit('update:modelValue', view.value)"
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
import { Kanban, LayoutList, Table2 } from "lucide-vue-next";

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
  { value: 'table', label: 'Table', icon: Table2 },
  { value: 'list', label: 'List', icon: LayoutList },
  { value: 'kanban', label: 'Kanban', icon: Kanban }
]
</script>
