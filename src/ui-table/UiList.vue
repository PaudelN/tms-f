<template>
  <div
    ref="rootEl"
    class="flex flex-col"
    :class="isFullscreen ? 'z-50 rounded-none overflow-hidden' : 'rounded-sm '"
  >
    <!-- ══════════════════════════════════════════════════════════
         STICKY HEADER
    ══════════════════════════════════════════════════════════ -->
    <header
      class="ui-list-header shrink-0 sticky top-0 z-30 border border-border bg-card"
    >
      <!-- Top row: 7 controls in a single clean bar -->
      <div class="flex items-center gap-1 px-3 py-2 border-b border-border/50">
        <!-- ① Info -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <Popover>
                <PopoverTrigger as-child>
                  <button type="button" class="ui-hbtn">
                    <Info class="w-4 h-4" />
                    <span class="ui-hbtn-label">Info</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  class="w-72 p-4 rounded-sm border border-border bg-popover shadow-xl text-xs"
                >
                  <p class="font-semibold text-foreground mb-1">List View</p>
                  <p class="text-muted-foreground leading-relaxed mb-3">
                    Infinite-scroll list with expandable rows, live grouping and
                    sorting. Items load progressively as you scroll.
                  </p>
                  <div
                    class="flex items-center gap-1.5 font-mono text-muted-foreground text-[11px]"
                  >
                    <span class="font-bold text-foreground">{{
                      loadedCount
                    }}</span>
                    <span>of</span>
                    <span class="font-bold text-foreground">{{
                      totalCount
                    }}</span>
                    <span>loaded</span>
                    <span
                      v-if="hasMore"
                      class="ml-auto text-primary text-[10px] animate-pulse"
                      >↓ more</span
                    >
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs"
              >About this list</TooltipContent
            >
          </Tooltip>
        </TooltipProvider>

        <div class="ui-hsep" />

        <!-- ② Group By -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <Popover v-model:open="groupByOpen">
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="ui-hbtn"
                    :class="groupByKey ? 'ui-hbtn--active' : ''"
                  >
                    <Layers2 class="w-4 h-4" />
                    <span class="ui-hbtn-label">Group</span>
                    <span v-if="groupByKey" class="ui-hbtn-badge">ON</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  class="w-44 p-1.5 rounded-sm border border-border bg-popover shadow-xl"
                >
                  <p
                    class="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5 mb-0.5"
                  >
                    Group by
                  </p>
                  <button
                    class="ui-dditem"
                    :class="!groupByKey ? 'ui-dditem--on' : ''"
                    @click="
                      () => {
                        setGroupBy(null);
                        groupByOpen = false;
                      }
                    "
                  >
                    <Check
                      class="w-3 h-3 shrink-0"
                      :class="!groupByKey ? 'opacity-100' : 'opacity-0'"
                    />
                    None
                  </button>
                  <button
                    v-for="opt in features?.groupBy ?? []"
                    :key="opt.key"
                    class="ui-dditem"
                    :class="groupByKey === opt.key ? 'ui-dditem--on' : ''"
                    @click="
                      () => {
                        setGroupBy(opt.key);
                        groupByOpen = false;
                      }
                    "
                  >
                    <Check
                      class="w-3 h-3 shrink-0"
                      :class="
                        groupByKey === opt.key ? 'opacity-100' : 'opacity-0'
                      "
                    />
                    {{ opt.label }}
                  </button>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs">{{
              groupByKey ? `Grouped: ${groupByKey}` : "Group by field"
            }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- ③ Sort -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <Popover v-model:open="sortOpen">
                <PopoverTrigger as-child>
                  <button
                    type="button"
                    class="ui-hbtn"
                    :class="sortKey ? 'ui-hbtn--active' : ''"
                  >
                    <ArrowUpDown class="w-4 h-4" />
                    <span class="ui-hbtn-label">Sort</span>
                    <span
                      v-if="sortKey"
                      class="ui-hbtn-badge flex items-center gap-0.5"
                    >
                      <ArrowUp v-if="sortOrder === 'asc'" class="w-2.5 h-2.5" />
                      <ArrowDown v-else class="w-2.5 h-2.5" />
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  class="w-52 p-1.5 rounded-sm border border-border bg-popover shadow-xl"
                >
                  <p
                    class="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5 mb-0.5"
                  >
                    Sort by
                  </p>
                  <button
                    class="ui-dditem"
                    :class="!sortKey ? 'ui-dditem--on' : ''"
                    @click="
                      () => {
                        handleSort(null, null);
                        sortOpen = false;
                      }
                    "
                  >
                    <Check
                      class="w-3 h-3 shrink-0"
                      :class="!sortKey ? 'opacity-100' : 'opacity-0'"
                    />
                    Default
                  </button>
                  <button
                    v-for="opt in features?.sortOptions ?? []"
                    :key="opt.key"
                    class="ui-dditem justify-between"
                    :class="sortKey === opt.key ? 'ui-dditem--on' : ''"
                    @click="cycleSort(opt.key)"
                  >
                    <span class="flex items-center gap-2">
                      <Check
                        class="w-3 h-3 shrink-0"
                        :class="
                          sortKey === opt.key ? 'opacity-100' : 'opacity-0'
                        "
                      />
                      {{ opt.label }}
                    </span>
                    <span class="flex items-center shrink-0">
                      <ArrowUp
                        v-if="sortKey === opt.key && sortOrder === 'asc'"
                        class="w-3 h-3 text-primary"
                      />
                      <ArrowDown
                        v-else-if="sortKey === opt.key && sortOrder === 'desc'"
                        class="w-3 h-3 text-primary"
                      />
                    </span>
                  </button>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs">{{
              sortKey ? `Sorted: ${sortKey} (${sortOrder})` : "Sort items"
            }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- ④ Density -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <button type="button" class="ui-hbtn" @click="cycleDensity">
                <component :is="densityIcon" class="w-4 h-4" />
                <span class="ui-hbtn-label capitalize">{{ density }}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs capitalize"
              >{{ density }} density</TooltipContent
            >
          </Tooltip>
        </TooltipProvider>

        <!-- ⑤ Copy JSON -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="ui-hbtn"
                :class="copyDone ? 'ui-hbtn--active' : ''"
                @click="copyItems"
              >
                <CheckCheck v-if="copyDone" class="w-4 h-4" />
                <Copy v-else class="w-4 h-4" />
                <span class="ui-hbtn-label">{{
                  copyDone ? "Copied" : "Copy"
                }}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs">{{
              copyDone ? "Copied to clipboard!" : "Copy items as JSON"
            }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- ⑥ Refresh -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="ui-hbtn"
                :class="isRefreshing ? 'ui-hbtn--active' : ''"
                @click="onRefresh"
              >
                <RefreshCw
                  class="w-4 h-4"
                  :class="isRefreshing ? 'animate-spin' : ''"
                />
                <span class="ui-hbtn-label">Refresh</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs"
              >Reload list</TooltipContent
            >
          </Tooltip>
        </TooltipProvider>

        <div class="ui-hsep" />

        <!-- ⑦ Fullscreen -->
        <TooltipProvider :delay-duration="120">
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="ui-hbtn"
                :class="isFullscreen ? 'ui-hbtn--active' : ''"
                @click="isFullscreen = !isFullscreen"
              >
                <Minimize v-if="isFullscreen" class="w-4 h-4" />
                <Maximize v-else class="w-4 h-4" />
                <span class="ui-hbtn-label">{{
                  isFullscreen ? "Exit" : "Expand"
                }}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" class="text-xs">{{
              isFullscreen ? "Exit fullscreen" : "Fullscreen"
            }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Right: item count pill -->
        <div class="ml-auto flex items-center gap-2 shrink-0">
          <div class="ui-count-pill">
            <span class="font-bold text-foreground tabular-nums">{{
              loadedCount
            }}</span>
            <span class="text-muted-foreground/50 mx-0.5">/</span>
            <span class="text-muted-foreground tabular-nums">{{
              totalCount
            }}</span>
          </div>
        </div>
      </div>

      <!-- Scroll progress bar -->
      <div class="ui-scroll-track">
        <div class="ui-scroll-fill" :style="{ width: `${scrollProgress}%` }" />
      </div>
    </header>

    <!-- ══════════════════════════════════════════════════════════
         BODY — grows with content; fullscreen gets overflow-y-auto
    ══════════════════════════════════════════════════════════ -->
    <div
      ref="scrollContainer"
      class="ui-list-body border border-border bg-card"
      :class="isFullscreen ? 'flex-1 min-h-0 overflow-y-auto ' : ''"
    >
      <!-- ── Initial skeleton ── -->
      <template v-if="isInitialLoading">
        <div
          v-for="i in 8"
          :key="`sk-init-${i}`"
          class="border-b border-border/40"
          :class="itemPaddingClass"
          :style="{ opacity: 1 - (i - 1) * 0.1 }"
        >
          <slot name="skeleton" :index="i">
            <UiListSkeleton />
          </slot>
        </div>
      </template>

      <!-- ── Error ── -->
      <template v-else-if="error">
        <div class="flex flex-col items-center gap-4 py-20 px-8">
          <div
            class="w-12 h-12 rounded-sm border border-destructive/30 bg-destructive/8 flex items-center justify-center"
          >
            <AlertCircle class="w-5 h-5 text-destructive" />
          </div>
          <div class="text-center space-y-1">
            <p class="text-sm font-semibold text-foreground">
              Failed to load items
            </p>
            <p class="text-xs text-muted-foreground">{{ error }}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="h-8 px-4 rounded-sm text-xs gap-1.5"
            @click="reload"
          >
            <RefreshCw class="w-3.5 h-3.5" />Try again
          </Button>
        </div>
      </template>

      <!-- ── Empty ── -->
      <template v-else-if="isEmpty">
        <div class="flex flex-col items-center gap-4 py-20 px-8">
          <div
            class="w-14 h-14 rounded-sm border-2 border-dashed border-border flex items-center justify-center"
          >
            <List class="w-6 h-6 text-muted-foreground/40" />
          </div>
          <div class="text-center space-y-1">
            <p class="text-sm font-semibold text-foreground/70">
              No results found
            </p>
            <p class="text-xs text-muted-foreground/60">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      </template>

      <!-- ── Items ── -->
      <template v-else>
        <template v-for="group in groupedItems" :key="group.key">
          <!-- Group header -->
          <div
            v-if="group.label !== null"
            class="ui-group-header sticky top-0 z-10 flex items-center gap-2.5 border-b border-border bg-muted/90 backdrop-blur-sm cursor-pointer select-none px-4 py-2"
            @click="toggleGroup(group.key)"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span
              class="text-[11px] font-bold text-primary uppercase tracking-widest flex-1 truncate"
            >
              {{ group.label }}
            </span>
            <span
              class="text-[10px] font-mono text-muted-foreground bg-border/50 px-1.5 py-0.5 rounded-sm shrink-0"
            >
              {{ group.items.length }}
            </span>
            <ChevronDown
              class="w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 shrink-0"
              :class="collapsedGroups.has(group.key) ? '-rotate-90' : ''"
            />
          </div>

          <template v-if="!collapsedGroups.has(group.key)">
            <div
              v-for="(item, localIdx) in group.items"
              :key="resolveItemKey(item, localIdx)"
              class="ui-item-block"
              :class="[
                isNewItem(item, localIdx, group) ? 'ui-item-enter' : '',
                isScrolling ? 'ui-item-scroll' : '',
              ]"
            >
              <!-- Row -->
              <div
                :class="[
                  'ui-row group/row flex items-center justify-between cursor-pointer border-b border-border/50',
                  itemPaddingClass,
                ]"
                @click="emit('row-click', item)"
              >
                <div class="ui-row-pip shrink-0" />

                <div class="flex-1 min-w-0 pl-2">
                  <slot
                    name="item-summary"
                    :item="item"
                    :index="localIdx"
                    :is-new="isNewItem(item, localIdx, group)"
                    :is-expanded="
                      expandedItems.has(resolveItemKey(item, localIdx))
                    "
                  >
                    <span class="text-sm text-foreground truncate">{{
                      getDefaultLabel(item)
                    }}</span>
                  </slot>
                </div>

                <div class="flex items-center gap-2 shrink-0 ml-4" @click.stop>
                  <slot name="item-actions" :item="item" :index="localIdx" />
                  <button
                    type="button"
                    class="ui-chevron-btn"
                    :class="
                      expandedItems.has(resolveItemKey(item, localIdx))
                        ? 'ui-chevron-btn--open'
                        : ''
                    "
                    @click.stop="toggleExpand(resolveItemKey(item, localIdx))"
                  >
                    <ChevronDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Expanded panel -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                leave-active-class="transition-all duration-150 ease-in"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div
                  v-if="expandedItems.has(resolveItemKey(item, localIdx))"
                  class="ui-expanded-panel border-b border-border/40"
                >
                  <div :class="itemPaddingClass">
                    <slot name="item-expanded" :item="item" :index="localIdx">
                      <pre
                        class="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto"
                        >{{ JSON.stringify(item, null, 2) }}</pre
                      >
                    </slot>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
        </template>

        <!-- ── Sentinel: triggers load-more via viewport IntersectionObserver ── -->
        <div ref="sentinel" class="w-full">
          <template v-if="isLoadingMore">
            <div
              v-for="i in 3"
              :key="`sk-more-${i}`"
              class="border-b border-border/30"
              :class="itemPaddingClass"
              :style="{ opacity: 1 - (i - 1) * 0.3 }"
            >
              <slot name="skeleton" :index="i">
                <UiListSkeleton />
              </slot>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         STICKY FOOTER
    ══════════════════════════════════════════════════════════ -->
    <footer
      v-if="!isInitialLoading && !error"
      class="ui-list-footer shrink-0 sticky bottom-0 z-30 border border-border bg-card"
    >
      <div class="ui-footer-bar-track">
        <div
          class="ui-footer-bar-fill"
          :style="{ width: `${footerProgress}%` }"
        />
      </div>

      <div class="flex items-center justify-between gap-4 px-4 py-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="relative shrink-0">
            <span
              v-if="isLoadingMore"
              class="absolute inset-0 rounded-full bg-primary animate-ping opacity-50"
            />
            <span
              class="relative block w-2 h-2 rounded-full"
              :class="
                isLoadingMore
                  ? 'bg-primary'
                  : hasMore
                    ? 'bg-primary/60'
                    : 'bg-muted-foreground/30'
              "
            />
          </div>

          <div class="flex items-center gap-1.5 text-xs">
            <span class="font-bold text-foreground tabular-nums">{{
              loadedCount
            }}</span>
            <span class="text-muted-foreground/50">of</span>
            <span class="text-muted-foreground tabular-nums">{{
              totalCount
            }}</span>
            <span class="text-muted-foreground/40 mx-0.5">·</span>
            <span
              class="text-xs font-medium"
              :class="
                isLoadingMore
                  ? 'text-primary'
                  : hasMore
                    ? 'text-muted-foreground/60'
                    : 'text-muted-foreground/40'
              "
            >
              <template v-if="isLoadingMore">Loading…</template>
              <template v-else-if="hasMore">Scroll to load more</template>
              <template v-else>All loaded</template>
            </span>
          </div>
        </div>

        <!-- Circular scroll progress -->
        <div class="relative shrink-0 w-12 h-12">
          <svg class="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="rgb(var(--color-muted-foreground))"
              stroke-width="2.5"
              opacity="0.2"
            />
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="rgb(var(--color-primary))"
              stroke-width="2.5"
              stroke-linecap="round"
              :stroke-dasharray="`${(scrollProgress / 100) * 94.25} 94.25`"
              class="transition-all duration-500 ease-out"
              style="
                filter: drop-shadow(0 0 2.5px rgb(var(--color-primary) / 1));
              "
            />
            <circle
              v-if="scrollProgress > 2"
              cx="20"
              cy="5"
              r="2.2"
              fill="rgb(var(--color-primary))"
              :transform="`rotate(${scrollProgress * 3.6} 20 20)`"
              class="transition-all duration-500 ease-out"
              style="filter: drop-shadow(0 0 4px rgb(var(--color-primary)))"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span
              class="text-[9px] font-black text-primary leading-none tracking-tight flex items-baseline gap-x-px"
            >
              {{ Math.round(scrollProgress)
              }}<span class="text-[9px] font-extrabold opacity-75">%</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
  import { useIntersectionObserver, useScroll } from "@vueuse/core";
  import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    CheckCheck,
    ChevronDown,
    Copy,
    GalleryVertical,
    Info,
    Layers2,
    List,
    Maximize,
    Maximize2,
    Minimize,
    Minimize2,
    RefreshCw,
  } from "lucide-vue-next";
  import { computed, defineComponent, h, ref, watch } from "vue";
  import { useListInteractions } from "./composables/useListInteractions";
  import type {
    ListConfig,
    ListDensity,
    ListFeatures,
    ListFetchFn,
    ListGroup,
    ListSortOrder,
  } from "./types/list.types";

  // ── Built-in skeleton ──────────────────────────────────────────────────────
  const UiListSkeleton = defineComponent({
    setup() {
      return () =>
        h("div", { class: "flex items-center gap-3 animate-pulse" }, [
          h("div", { class: "w-9 h-9 rounded-sm bg-border/60 shrink-0" }),
          h("div", { class: "flex-1 space-y-2 py-0.5" }, [
            h("div", { class: "h-3 bg-border/60 rounded-sm w-2/5" }),
            h("div", { class: "h-2.5 bg-border/40 rounded-sm w-3/5" }),
          ]),
          h("div", { class: "h-6 w-14 bg-border/40 rounded-sm shrink-0" }),
        ]);
    },
  });

  // ── Props ──────────────────────────────────────────────────────────────────
  interface Props {
    listId: string;
    fetchFn: ListFetchFn;
    config?: ListConfig;
    features?: ListFeatures;
    externalSearch?: string;
    externalFilter?: Record<string, any> | null;
    itemKey?: string | ((item: any) => string | number);
  }

  const props = withDefaults(defineProps<Props>(), {
    config: () => ({}),
    itemKey: "id",
  });

  const emit = defineEmits<{ "row-click": [item: any] }>();

  // ── Composable ─────────────────────────────────────────────────────────────
  const externalFilterRef = computed(() => props.externalFilter);

  const {
    loadedItems,
    groupedItems,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    error,
    totalCount,
    loadedCount,
    isEmpty,
    groupByKey,
    sortKey,
    sortOrder,
    newItemIndexes,
    loadMore,
    reload,
    handleSearch,
    handleSort,
    setGroupBy,
  } = useListInteractions(
    props.listId,
    props.fetchFn,
    props.config,
    externalFilterRef,
  );

  watch(
    () => props.externalSearch,
    (val) => {
      if (val !== undefined) handleSearch(val);
    },
  );

  // ── Refs ───────────────────────────────────────────────────────────────────
  const rootEl = ref<HTMLElement | null>(null);
  const isFullscreen = ref(false);
  const scrollContainer = ref<HTMLElement | null>(null);
  const scrollProgress = ref(0);
  const isScrolling = ref(false);
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Scroll tracking ────────────────────────────────────────────────────────
  // Normal mode: track window scroll so the component grows naturally.
  // Fullscreen mode: track the internal scrollContainer div.
  const { y: windowScrollY } = useScroll(window);

  watch(windowScrollY, () => {
    if (isFullscreen.value) return; // handled by onContainerScroll
    const max = document.body.scrollHeight - window.innerHeight;
    scrollProgress.value = max > 0 ? (windowScrollY.value / max) * 100 : 0;

    isScrolling.value = true;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling.value = false;
    }, 120);
  });

  // Used only in fullscreen mode (the div scrolls, not the window)
  function onContainerScroll(): void {
    if (!scrollContainer.value) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    const max = scrollHeight - clientHeight;
    scrollProgress.value = max > 0 ? (scrollTop / max) * 100 : 0;

    isScrolling.value = true;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling.value = false;
    }, 120);
  }

  // Wire onContainerScroll only when fullscreen is active
  watch(isFullscreen, (fs) => {
    if (!scrollContainer.value) return;
    if (fs) {
      scrollContainer.value.addEventListener("scroll", onContainerScroll);
    } else {
      scrollContainer.value.removeEventListener("scroll", onContainerScroll);
      scrollProgress.value = 0;
    }
  });

  // footerProgress = load progress while loading, else scroll progress
  const footerProgress = computed(() => {
    if (totalCount.value === 0) return 0;
    if (isLoadingMore.value || hasMore.value) {
      return Math.round((loadedCount.value / totalCount.value) * 100);
    }
    return scrollProgress.value;
  });

  // ── Infinite scroll sentinel ───────────────────────────────────────────────
  // No `root` — uses the viewport so it works with natural page scroll.
  // In fullscreen mode the sentinel is still visible because the container
  // fills the viewport, so viewport-based detection still fires correctly.
  const sentinel = ref<HTMLElement | null>(null);
  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (
        entry.isIntersecting &&
        hasMore.value &&
        !isLoadingMore.value &&
        !isInitialLoading.value
      ) {
        loadMore();
      }
    },
    { threshold: props.config?.sentinelThreshold ?? 0.1 },
  );

  // ── Expand/collapse rows ───────────────────────────────────────────────────
  const expandedItems = ref<Set<string | number>>(new Set());

  function resolveItemKey(item: any, fallbackIndex: number): string | number {
    if (typeof props.itemKey === "function") return props.itemKey(item);
    const val = item?.[props.itemKey as string];
    return val != null ? val : `__idx_${fallbackIndex}`;
  }

  function toggleExpand(key: string | number): void {
    if (expandedItems.value.has(key)) expandedItems.value.delete(key);
    else expandedItems.value.add(key);
    expandedItems.value = new Set(expandedItems.value);
  }

  // ── Group collapse ─────────────────────────────────────────────────────────
  const collapsedGroups = ref<Set<string>>(new Set());
  function toggleGroup(key: string): void {
    if (collapsedGroups.value.has(key)) collapsedGroups.value.delete(key);
    else collapsedGroups.value.add(key);
    collapsedGroups.value = new Set(collapsedGroups.value);
  }

  // ── New-item detection ─────────────────────────────────────────────────────
  function isNewItem(item: any, localIdx: number, group: ListGroup): boolean {
    const globalOffset = loadedItems.value.indexOf(group.items[localIdx]);
    return newItemIndexes.value.has(globalOffset);
  }

  function getDefaultLabel(item: any): string {
    return item?.name ?? item?.title ?? item?.label ?? JSON.stringify(item);
  }

  // ── Density ────────────────────────────────────────────────────────────────
  const densities: ListDensity[] = ["default", "compact", "comfortable"];
  const density = ref<ListDensity>("default");

  const densityIcon = computed(() => {
    if (density.value === "compact") return Minimize2;
    if (density.value === "comfortable") return Maximize2;
    return GalleryVertical;
  });

  function cycleDensity(): void {
    const idx = densities.indexOf(density.value);
    density.value = densities[(idx + 1) % densities.length];
  }

  const itemPaddingClass = computed(() => {
    if (density.value === "compact") return "px-4 py-2";
    if (density.value === "comfortable") return "px-4 py-5";
    return "px-4 py-3.5";
  });

  // ── Copy JSON ──────────────────────────────────────────────────────────────
  const copyDone = ref(false);
  function copyItems(): void {
    navigator.clipboard
      .writeText(JSON.stringify(loadedItems.value, null, 2))
      .then(() => {
        copyDone.value = true;
        setTimeout(() => (copyDone.value = false), 2000);
      });
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  const isRefreshing = ref(false);
  async function onRefresh(): Promise<void> {
    isRefreshing.value = true;
    await reload();
    setTimeout(() => {
      isRefreshing.value = false;
    }, 600);
  }

  // ── Sort cycling ───────────────────────────────────────────────────────────
  const sortOpen = ref(false);
  const groupByOpen = ref(false);

  function cycleSort(key: string): void {
    let order: ListSortOrder;
    if (sortKey.value !== key) {
      order = "asc";
    } else if (sortOrder.value === "asc") {
      order = "desc";
    } else {
      handleSort(null, null);
      sortOpen.value = false;
      return;
    }
    handleSort(key, order);
    sortOpen.value = false;
  }

  defineExpose({ refresh: onRefresh, loadMore });
</script>

<style scoped>
  /* ═══════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════ */
  .ui-list-header {
    box-shadow:
      0 1px 0 rgb(var(--color-border)),
      0 2px 8px -2px rgba(0, 0, 0, 0.06);
  }

  .ui-hbtn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 4px;
    border: 1px solid transparent;
    font-size: 12px;
    font-weight: 500;
    color: rgb(var(--color-muted-foreground));
    background: transparent;
    cursor: pointer;
    transition:
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease;
    white-space: nowrap;
    flex-shrink: 0;
    height: 30px;
  }
  .ui-hbtn:hover {
    background: rgb(var(--color-muted));
    color: rgb(var(--color-foreground));
    border-color: rgb(var(--color-border) / 0.6);
  }
  .ui-hbtn--active {
    background: rgb(var(--color-primary) / 0.1);
    color: rgb(var(--color-primary));
    border-color: rgb(var(--color-primary) / 0.2);
  }
  .ui-hbtn--active:hover {
    background: rgb(var(--color-primary) / 0.18);
  }

  .ui-hbtn-label {
    font-size: 11px;
    line-height: 1;
  }

  .ui-hbtn-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 800;
    background: rgb(var(--color-primary));
    color: rgb(var(--color-primary-foreground));
    letter-spacing: 0.02em;
  }

  .ui-hsep {
    width: 1px;
    height: 20px;
    background: rgb(var(--color-border));
    margin: 0 3px;
    flex-shrink: 0;
  }

  .ui-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid rgb(var(--color-border) / 0.7);
    background: rgb(var(--color-muted) / 0.5);
    font-size: 12px;
  }

  .ui-scroll-track {
    height: 2px;
    background: rgb(var(--color-border) / 0.3);
    position: relative;
    overflow: hidden;
  }
  .ui-scroll-fill {
    position: absolute;
    inset-y: 0;
    left: 0;
    background: rgb(var(--color-primary));
    transition: width 0.1s linear;
    border-radius: 0 9999px 9999px 0;
  }

  /* ═══════════════════════════════════════════════════
   DROPDOWN ITEMS
═══════════════════════════════════════════════════ */
  .ui-dditem {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: rgb(var(--color-foreground));
    cursor: pointer;
    transition: background 0.1s ease;
  }
  .ui-dditem:hover {
    background: rgb(var(--color-accent));
  }
  .ui-dditem--on {
    color: rgb(var(--color-primary));
    font-weight: 600;
  }

  /* ═══════════════════════════════════════════════════
   BODY
═══════════════════════════════════════════════════ */
  .ui-list-body {
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--color-border) / 0.5) transparent;
    background: rgb(var(--color-background));
  }
  .ui-list-body::-webkit-scrollbar {
    width: 4px;
  }
  .ui-list-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .ui-list-body::-webkit-scrollbar-thumb {
    background: rgb(var(--color-border) / 0.5);
    border-radius: 9999px;
  }
  .ui-list-body::-webkit-scrollbar-thumb:hover {
    background: rgb(var(--color-primary) / 0.4);
  }

  /* ═══════════════════════════════════════════════════
   GROUP HEADER
═══════════════════════════════════════════════════ */
  .ui-group-header {
    transition: background 0.12s ease;
  }
  .ui-group-header:hover {
    background: rgb(var(--color-muted));
  }

  /* ═══════════════════════════════════════════════════
   ROW
═══════════════════════════════════════════════════ */
  .ui-row {
    position: relative;
    transition: background 0.12s ease;
  }
  .ui-row:hover {
    background: rgb(var(--color-accent) / 0.6);
  }

  .ui-row-pip {
    width: 2px;
    align-self: stretch;
    border-radius: 0 2px 2px 0;
    background: rgb(var(--color-primary));
    opacity: 0;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
    margin-right: -2px;
  }
  .ui-row:hover .ui-row-pip {
    opacity: 1;
  }

  .ui-chevron-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid rgb(var(--color-border) / 0.5);
    color: rgb(var(--color-muted-foreground));
    background: transparent;
    opacity: 0;
    cursor: pointer;
    transition:
      opacity 0.12s ease,
      transform 0.2s ease,
      background 0.12s ease,
      border-color 0.12s ease;
  }
  .group\/row:hover .ui-chevron-btn {
    opacity: 0.8;
  }
  .ui-chevron-btn:hover {
    opacity: 1 !important;
    background: rgb(var(--color-muted));
    border-color: rgb(var(--color-border));
  }
  .ui-chevron-btn--open {
    opacity: 1 !important;
    transform: rotate(180deg);
    background: rgb(var(--color-primary) / 0.1);
    border-color: rgb(var(--color-primary) / 0.3);
    color: rgb(var(--color-primary));
  }

  /* ═══════════════════════════════════════════════════
   EXPANDED PANEL
═══════════════════════════════════════════════════ */
  .ui-expanded-panel {
    background: rgb(var(--color-muted) / 0.35);
    border-top: 1px solid rgb(var(--color-border) / 0.4);
    border-left: 3px solid rgb(var(--color-primary) / 0.3);
  }

  /* ═══════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════ */
  .ui-list-footer {
    box-shadow:
      0 -1px 0 rgb(var(--color-border)),
      0 -4px 12px -4px rgba(0, 0, 0, 0.06);
  }

  .ui-footer-bar-track {
    height: 3px;
    background: rgb(var(--color-border) / 0.3);
    position: relative;
    overflow: visible;
  }
  .ui-footer-bar-fill {
    position: absolute;
    inset-y: 0;
    left: 0;
    background: linear-gradient(
      90deg,
      rgb(var(--color-primary) / 0.6) 0%,
      rgb(var(--color-primary)) 100%
    );
    border-radius: 0 3px 3px 0;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 6px rgb(var(--color-primary) / 0.4);
  }

  /* ═══════════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════════ */
  .ui-item-enter {
    animation: itemReveal 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @keyframes itemReveal {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .ui-item-scroll .ui-row {
    transition: background 0.06s ease;
  }
</style>
