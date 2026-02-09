<template>
  <div class="mb-6">
    <div class="bg-card rounded-lg shadow-sm border border-border p-1">
      <div class="flex items-center gap-1">
        <button
          v-for="view in views"
          :key="view.value"
          @click="$emit('update:modelValue', view.value)"
          :class="[
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
            modelValue === view.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          ]"
        >
          <component :is="view.icon" class="h-4 w-4" />
          <span>{{ view.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { ViewMode } from './types/table.types'

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

// Icons as functional components
const TableIcon = () => h('svg', {
  class: 'h-4 w-4',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
  })
])

const ListIcon = () => h('svg', {
  class: 'h-4 w-4',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M4 6h16M4 10h16M4 14h16M4 18h16'
  })
])

const KanbanIcon = () => h('svg', {
  class: 'h-4 w-4',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  })
])

const views: ViewOption[] = [
  { value: 'table', label: 'Table', icon: TableIcon },
  { value: 'list', label: 'List', icon: ListIcon },
  { value: 'kanban', label: 'Kanban', icon: KanbanIcon }
]
</script>