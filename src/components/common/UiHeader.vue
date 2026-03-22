<template>
  <div class="mb-8">
    <div
      class="crud-shell rounded-[28px] border border-border/60 bg-card/90 p-4 shadow-[0_20px_60px_rgb(15_23_42/0.08)] backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:p-5"
    >
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.65)]"
            >
              <span
                class="h-7 w-1.5 rounded-full bg-primary/80 shadow-[0_0_18px_rgb(var(--color-primary)/0.3)]"
              />
            </div>
            <div class="space-y-1">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary/70"
              >
                Workspace records
              </p>
              <h1
                class="text-2xl font-semibold leading-none tracking-tight text-foreground sm:text-[2rem]"
              >
                {{ title }}
              </h1>
            </div>
          </div>

          <div v-if="stats && stats.length" class="flex flex-wrap items-center gap-2 pl-0.5">
            <template v-for="stat in stats" :key="stat.label">
              <Badge :color="resolveStatColor(stat)">
                {{ stat.value }} {{ stat.label }}
              </Badge>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-3 shrink-0 lg:items-end">
          <div class="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
            <slot name="actions" />

            <ExpandableSearch
              v-if="showSearch"
              :model-value="searchValue ?? ''"
              :search-placeholder="searchPlaceholder"
              @update:model-value="(v) => emit('update:searchValue', v)"
            />

            <TooltipProvider v-if="showViews" :delay-duration="200">
              <div class="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-1.5">
                <Tooltip v-for="view in views" :key="view.id">
                  <TooltipTrigger as-child>
                    <Button
                      type="button"
                      class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200"
                      :class="
                        currentView === view.id
                          ? [view.activeClass, 'scale-[1.02] shadow-[0_12px_24px_rgb(var(--color-primary)/0.18)]']
                          : 'bg-transparent text-primary hover:bg-primary/10 hover:text-foreground'
                      "
                      @click="emit('update:currentView', view.id)"
                    >
                      <component :is="view.icon" class="h-4.5 w-4.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                    {{ view.label }}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <TooltipProvider v-if="showFilter" :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    type="button"
                    class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary transition-all duration-200 hover:bg-primary/10 hover:text-foreground"
                    :class="activeFilterCount > 0 ? 'ring-1 ring-primary/40' : ''"
                    @click="filterOpen = true"
                  >
                    <SlidersHorizontal class="h-4.5 w-4.5" />
                    <Transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 scale-50"
                      enter-to-class="opacity-100 scale-100"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 scale-100"
                      leave-to-class="opacity-0 scale-50"
                    >
                      <span
                        v-if="activeFilterCount > 0"
                        class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                      >
                        {{ activeFilterCount > 9 ? '9+' : activeFilterCount }}
                      </span>
                    </Transition>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                  Filters{{ activeFilterCount > 0 ? ` (${activeFilterCount} active)` : '' }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider v-if="showRefresh" :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    type="button"
                    :disabled="loading"
                    class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/60 bg-background/80 text-primary transition-all duration-200 hover:bg-primary/10"
                    @click="emit('refresh')"
                  >
                    <RefreshCcw
                      class="h-4.5 w-4.5 transition-transform duration-500"
                      :class="loading ? 'animate-spin' : ''"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                  Refresh
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              v-if="createLabel"
              type="button"
              class="group relative inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/15 bg-primary px-4 py-2.5 text-primary-foreground shadow-[0_16px_30px_rgb(var(--color-primary)/0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgb(var(--color-primary)/0.3)]"
              @click="emit('create')"
            >
              <span
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/14 ring-1 ring-white/20"
              >
                <Plus
                  class="h-4.5 w-4.5 shrink-0 transition-transform duration-300 ease-in-out group-hover:rotate-90"
                />
              </span>
              <span class="whitespace-nowrap text-sm font-semibold">
                {{ createLabel }}
              </span>
            </Button>
          </div>

          <div
            class="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.65)]"
          >
            <slot name="toolbar-summary" />
            <p class="text-xs text-muted-foreground">
              Tailored controls for navigation, filtering, and quick actions.
            </p>
          </div>
        </div>
      </div>
    </div>

    <UiFilter
      v-if="showFilter"
      v-model:open="filterOpen"
      :creator-options="filterCreatorOptions"
      :tag-options="filterTagOptions"
      :values="filterValues"
      @apply="(filters) => emit('apply-filters', filters)"
    >
      <template v-if="$slots['filter-extra']" #extra="slotProps">
        <slot name="filter-extra" v-bind="slotProps" />
      </template>
    </UiFilter>
  </div>
</template>

<script setup lang="ts">
import ExpandableSearch from '@/components/common/ExpandableSearch.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDotColor } from '@/composables/useDotColor'
import type { ViewMode } from '@/ui-table/types/table.types'
import {
  Plus,
  RefreshCcw,
  SlidersHorizontal,
  SquareKanban,
  Table,
  TableOfContents,
} from 'lucide-vue-next'
import { ref } from 'vue'
import UiFilter from './UiFilter.vue'
import type { FilterOption } from './UiFilter.vue'
import type { ActiveFilters } from '../../types/filter.types'

export type { FilterOption }

const { getDotColor } = useDotColor()

const filterOpen = ref(false)

export type UiHeaderStat = {
  label: string
  value: number | string
  color?: string
  dot?: string
  badge?: string
}

const views = [
  {
    id: 'table' as ViewMode,
    label: 'Table',
    icon: Table,
    activeClass: 'bg-primary text-white',
  },
  {
    id: 'list' as ViewMode,
    label: 'List',
    icon: TableOfContents,
    activeClass: 'bg-primary text-white',
  },
  {
    id: 'kanban' as ViewMode,
    label: 'Kanban',
    icon: SquareKanban,
    activeClass: 'bg-primary text-white',
  },
]

withDefaults(
  defineProps<{
    title: string
    stats?: UiHeaderStat[]
    showViews?: boolean
    currentView?: ViewMode
    createLabel?: string
    showRefresh?: boolean
    loading?: boolean
    showSearch?: boolean
    searchValue?: string
    searchPlaceholder?: string
    showFilter?: boolean
    activeFilterCount?: number
    showSort?: boolean
    isSortActive?: boolean
    showExport?: boolean
    filterCreatorOptions?: FilterOption[]
    filterTagOptions?: FilterOption[]
    filterValues?: ActiveFilters
  }>(),
  {
    showSearch: false,
    searchPlaceholder: 'Search...',
    showFilter: false,
    activeFilterCount: 0,
    showSort: false,
    isSortActive: false,
    showExport: false,
    filterCreatorOptions: () => [],
    filterTagOptions: () => [],
    filterValues: () => ({}),
    stats: () => [],
    showViews: false,
    showRefresh: false,
    loading: false,
  },
)

const emit = defineEmits<{
  create: []
  refresh: []
  'update:currentView': [view: ViewMode]
  'update:searchValue': [value: string]
  'apply-filters': [filters: ActiveFilters]
}>()

function resolveStatColor(stat: UiHeaderStat) {
  if (stat.color) return stat.color
  return getDotColor(stat.dot ?? '')
}
</script>
