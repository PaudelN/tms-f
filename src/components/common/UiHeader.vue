<template>
  <section class="crud-shell-header mb-6 rounded-[28px] border border-border/60 bg-card/95 px-6 py-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.4)] backdrop-blur-sm">
    <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div class="min-w-0 space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ring-1 ring-primary/15">
            <span class="h-6 w-6 rounded-xl bg-primary/12" />
          </div>
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Workspace control center
            </p>
            <h1 class="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {{ title }}
            </h1>
          </div>
        </div>

        <div v-if="stats?.length" class="flex flex-wrap gap-2.5">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-2xl border border-border/60 bg-background/80 px-3.5 py-2 shadow-sm"
          >
            <div class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
                :style="{ backgroundColor: resolveStatColor(stat) }"
              />
              <span class="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {{ stat.label }}
              </span>
            </div>
            <p class="mt-1 text-base font-semibold text-foreground">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 xl:min-w-[22rem] xl:max-w-[34rem] xl:items-end">
        <div class="flex w-full flex-wrap items-center justify-end gap-2.5">
          <slot name="actions" />

          <div
            v-if="showSearch"
            class="min-w-[15rem] flex-1 xl:min-w-[18rem] xl:max-w-[22rem]"
          >
            <ExpandableSearch
              :model-value="searchValue ?? ''"
              :search-placeholder="searchPlaceholder"
              @update:model-value="(v) => emit('update:searchValue', v)"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-sm">
            <TooltipProvider v-if="showViews" :delay-duration="200">
              <div class="flex items-center gap-1.5">
                <Tooltip v-for="view in views" :key="view.id">
                  <TooltipTrigger as-child>
                    <Button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-transparent text-muted-foreground transition-all duration-200"
                      :class="
                        currentView === view.id
                          ? 'border-primary/20 bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(139,92,246,0.9)]'
                          : 'hover:border-border hover:bg-card hover:text-foreground'
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
                    class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-transparent text-muted-foreground transition-all duration-200 hover:border-border hover:bg-card hover:text-foreground"
                    :class="activeFilterCount > 0 ? 'border-primary/20 bg-primary/10 text-primary' : ''"
                    @click="filterOpen = true"
                  >
                    <SlidersHorizontal class="h-4.5 w-4.5" />
                    <span
                      v-if="activeFilterCount > 0"
                      class="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground"
                    >
                      {{ activeFilterCount > 9 ? '9+' : activeFilterCount }}
                    </span>
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
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-transparent text-muted-foreground transition-all duration-200 hover:border-border hover:bg-card hover:text-foreground"
                    @click="emit('refresh')"
                  >
                    <RefreshCcw class="h-4.5 w-4.5" :class="loading ? 'animate-spin' : ''" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" :side-offset="8" class="text-xs font-medium">
                  Refresh
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            v-if="createLabel"
            type="button"
            class="h-12 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-24px_rgba(139,92,246,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
            @click="emit('create')"
          >
            <Plus class="mr-2 h-4.5 w-4.5" />
            {{ createLabel }}
          </Button>
        </div>

        <div class="flex w-full flex-wrap justify-end gap-2 text-[11px] text-muted-foreground">
          <span class="rounded-full bg-background/80 px-3 py-1.5 ring-1 ring-border/60">
            Fast navigation between table, list, and kanban views
          </span>
          <span v-if="showFilter" class="rounded-full bg-background/80 px-3 py-1.5 ring-1 ring-border/60">
            Filter drawer keeps the screen clean until you need it
          </span>
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
  </section>
</template>

<script setup lang="ts">
import ExpandableSearch from '@/components/common/ExpandableSearch.vue'
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
  { id: 'table' as ViewMode, label: 'Table', icon: Table },
  { id: 'list' as ViewMode, label: 'List', icon: TableOfContents },
  { id: 'kanban' as ViewMode, label: 'Kanban', icon: SquareKanban },
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
  },
)

const emit = defineEmits<{
  (e: 'update:currentView', value: ViewMode): void
  (e: 'create'): void
  (e: 'refresh'): void
  (e: 'update:searchValue', value: string): void
  (e: 'filter'): void
  (e: 'sort'): void
  (e: 'export', format: 'csv' | 'json' | 'pdf'): void
  (e: 'apply-filters', filters: ActiveFilters): void
}>()

function resolveStatColor(stat: UiHeaderStat): string {
  if (stat.color && (stat.color.startsWith('#') || stat.color.startsWith('rgb'))) {
    return stat.color
  }
  return getDotColor(stat.dot ?? stat.color ?? '')
}
</script>
