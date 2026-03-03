<template>
  <div class="mb-8">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-2">
        <!-- Title row -->
        <div class="flex items-center gap-2.5">
          <span
            class="inline-block w-1 h-6 rounded-full bg-primary shrink-0"
            style="box-shadow: 0 0 8px rgb(var(--color-primary) / 0.6)"
          />
          <h1
            class="text-xl text-primary font-bold font-mono tracking-normal text-foreground leading-none"
          >
            {{ title }}
          </h1>
        </div>

        <!-- Stats chips -->
        <div
          v-if="stats && stats.length"
          class="flex items-center gap-1.5 pl-3.5"
        >
          <template v-for="stat in stats" :key="stat.label">
            <Badge :color="getDotColor(stat.dot ?? stat.color ?? '')">
              {{ stat.value }} {{ stat.label }}
            </Badge>
          </template>
        </div>
      </div>

      <!-- RIGHT TOOLBAR -->
      <div class="flex items-center gap-3 shrink-0">
        <slot name="actions" />

        <!-- Search -->
        <ExpandableSearch
          v-if="showSearch"
          :model-value="searchValue ?? ''"
          :search-placeholder="searchPlaceholder"
          @update:model-value="(v) => emit('update:searchValue', v)"
        />

        <!-- Views -->
        <TooltipProvider v-if="showViews" :delay-duration="200">
          <div class="flex items-center gap-3">
            <Tooltip v-for="view in views" :key="view.id">
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  class="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-200 bg-primary-20"
                  :class="
                    currentView === view.id
                      ? [view.activeClass, 'scale-[1.02]']
                      : 'text-primary hover:text-foreground hover:bg-background/60'
                  "
                  @click="emit('update:currentView', view.id)"
                >
                  <component :is="view.icon" class="h-4.5 w-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                :side-offset="8"
                class="text-xs font-medium"
              >
                {{ view.label }}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <!-- Filter -->
        <TooltipProvider v-if="showFilter" :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                type="button"
                class="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-200 bg-primary-20 text-primary hover:text-foreground hover:bg-background/60"
                @click="emit('filter')"
              >
                <SlidersHorizontal class="h-4.5 w-4.5" />
                <span
                  v-if="activeFilterCount > 0"
                  class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                >
                  {{ activeFilterCount }}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              :side-offset="8"
              class="text-xs font-medium"
            >
              Filters{{
                activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""
              }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Refresh -->
        <Tooltip v-if="showRefresh">
          <TooltipTrigger as-child>
            <Button
              type="button"
              :disabled="loading"
              class="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-200 bg-primary-20 text-primary"
              @click="emit('refresh')"
            >
              <RefreshCcw
                class="h-4.5 w-4.5 transition-transform duration-500"
                :class="loading ? 'animate-spin' : ''"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            :side-offset="8"
            class="text-xs font-medium"
          >
            Refresh
          </TooltipContent>
        </Tooltip>

        <Button
          v-if="createLabel"
          type="button"
          class="group cursor-pointer relative flex items-center justify-center h-10 w-10 rounded-full overflow-hidden transition-[width,padding] duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:w-44 hover:px-2"
          @click="emit('create')"
        >
          <Plus
            class="h-5 w-5 ml-2 shrink-0 transition-transform duration-600 ease-in-out group-hover:rotate-90"
          />
          <span
            class="whitespace-nowrap text-sm font-medium overflow-hidden max-w-0 opacity-0 ml-0 transition-[max-width,opacity,margin] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:max-w-[8rem] group-hover:opacity-100 group-hover:ml-1"
          >
            {{ createLabel }}
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ExpandableSearch from "@/components/common/ExpandableSearch.vue";
  import Badge from "@/components/ui/badge/Badge.vue";
  import Button from "@/components/ui/button/Button.vue";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
  import type { ViewMode } from "@/ui-table/types/table.types";
  import {
    Plus,
    RefreshCcw,
    SlidersHorizontal,
    SquareKanban,
    Table,
    TableOfContents,
  } from "lucide-vue-next";

  import { useDotColor } from "@/composables/useDotColor";
  const { getDotColor } = useDotColor();

  // Stat can come from the backend (dot + badge Tailwind classes)
  // or be defined manually (color hex/rgb for Badge :color prop)
  export type UiHeaderStat = {
    label: string;
    value: number | string;
    dot?: string;
    badge?: string;
    color?: string;
  };

  const views = [
    {
      id: "table" as ViewMode,
      label: "Table",
      icon: Table,
      activeClass:
        "bg-primary border border-gray-500 text-white active-no-hover",
    },
    {
      id: "list" as ViewMode,
      label: "List",
      icon: TableOfContents,
      activeClass:
        "bg-primary border border-gray-500 text-white active-no-hover",
    },
    {
      id: "kanban" as ViewMode,
      label: "Kanban",
      icon: SquareKanban,
      activeClass:
        "bg-primary border border-gray-500 text-white active-no-hover",
    },
  ];

  withDefaults(
    defineProps<{
      title: string;
      stats?: UiHeaderStat[];
      showViews?: boolean;
      currentView?: ViewMode;
      createLabel?: string;
      showRefresh?: boolean;
      loading?: boolean;
      showSearch?: boolean;
      searchValue?: string;
      searchPlaceholder?: string;
      showFilter?: boolean;
      activeFilterCount?: number;
      showSort?: boolean;
      isSortActive?: boolean;
      showExport?: boolean;
    }>(),
    {
      showSearch: false,
      searchPlaceholder: "Search...",
      showFilter: false,
      activeFilterCount: 0,
      showSort: false,
      isSortActive: false,
      showExport: false,
    },
  );

  const emit = defineEmits<{
    (e: "update:currentView", value: ViewMode): void;
    (e: "create"): void;
    (e: "refresh"): void;
    (e: "update:searchValue", value: string): void;
    (e: "filter"): void;
    (e: "sort"): void;
    (e: "export", format: "csv" | "json" | "pdf"): void;
  }>();
</script>
