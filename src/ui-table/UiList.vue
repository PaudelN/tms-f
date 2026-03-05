<template>
  <div
    ref="rootEl"
    class="rounded-sm overflow-hidden border border-border bg-card transition-all duration-300 flex flex-col"
    :class="
      isFullscreen
        ? 'fixed inset-0 z-50 rounded-none bg-background'
        : 'max-h-full'
    "
  >
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- HEADER                                                                 -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-primary-20 shrink-0"
    >
      <!-- Left: info icon + scroll-progress bar -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- Info tooltip -->
        <div class="relative group/info shrink-0">
          <Info class="h-3.5 w-3.5 text-primary cursor-pointer" />
          <div
            class="absolute top-full left-0 mt-2 w-72 z-50 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible pointer-events-none transition-all duration-200"
          >
            <div
              class="rounded-xl border border-border bg-popover shadow-2xl p-4 text-xs"
            >
              <div class="flex items-center gap-2 mb-2.5">
                <span class="font-semibold text-primary text-xs">
                  List View
                </span>
              </div>
              <p class="text-muted-foreground leading-relaxed mb-3">
                Infinite-scroll list with expandable rows, live grouping and
                sorting. Items load progressively as you scroll.
              </p>
              <div
                class="flex items-center gap-1.5 text-muted-foreground font-mono"
              >
                <span class="text-primary font-bold">{{ loadedCount }}</span>
                <span>of</span>
                <span class="font-bold">{{ totalCount }}</span>
                <span>items loaded</span>
                <span
                  v-if="hasMore"
                  class="ml-auto text-[10px] text-primary animate-pulse"
                >
                  more below ↓
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Scroll progress bar -->
        <div class="flex-1 flex items-center gap-2 min-w-0">
          <div
            class="flex-1 h-0.75 bg-border rounded-full overflow-hidden relative"
          >
            <!-- track fill -->
            <div
              class="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100 ease-linear"
              :style="{ width: `${scrollProgress}%` }"
            />
            <!-- subtle glow at leading edge -->
            <div
              class="absolute inset-y-0 w-4 bg-linear-to-r from-primary/60 to-transparent rounded-full transition-all duration-100 ease-linear"
              :style="{ left: `calc(${scrollProgress}% - 8px)` }"
            />
          </div>
          <span
            class="text-[10px] font-mono text-muted-foreground shrink-0 w-8 text-right tabular-nums"
          >
            {{ Math.round(scrollProgress) }}%
          </span>
        </div>
      </div>

      <!-- Right controls -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Group By -->
        <TooltipProvider v-if="features?.groupBy?.length" :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Popover v-model:open="groupByOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 rounded-lg cursor-pointer text-primary hover:text-primary hover:bg-secondary transition-colors"
                    :class="groupByKey ? 'bg-primary/10' : ''"
                  >
                    <Layers2 class="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  class="w-48 p-2 rounded-xl border border-border bg-popover shadow-xl"
                >
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5 mb-1"
                  >
                    Group By
                  </p>
                  <button
                    class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors"
                    :class="
                      !groupByKey
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    "
                    @click="
                      () => {
                        setGroupBy(null);
                        groupByOpen = false;
                      }
                    "
                  >
                    <Check
                      class="h-3 w-3 shrink-0"
                      :class="!groupByKey ? 'opacity-100' : 'opacity-0'"
                    />
                    None
                  </button>
                  <button
                    v-for="opt in features.groupBy"
                    :key="opt.key"
                    class="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors"
                    :class="
                      groupByKey === opt.key
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    "
                    @click="
                      () => {
                        setGroupBy(opt.key);
                        groupByOpen = false;
                      }
                    "
                  >
                    <Check
                      class="h-3 w-3 shrink-0"
                      :class="
                        groupByKey === opt.key ? 'opacity-100' : 'opacity-0'
                      "
                    />
                    {{ opt.label }}
                  </button>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg"
            >
              {{ groupByKey ? `Grouped by: ${groupByKey}` : "Group by field" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Sort -->
        <TooltipProvider
          v-if="features?.sortOptions?.length"
          :delay-duration="150"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <Popover v-model:open="sortOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 rounded-lg cursor-pointer text-primary hover:text-primary hover:bg-secondary transition-colors"
                    :class="sortKey ? 'bg-primary/10' : ''"
                  >
                    <ArrowUpDown class="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  class="w-52 p-2 rounded-xl border border-border bg-popover shadow-xl"
                >
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5 mb-1"
                  >
                    Sort By
                  </p>
                  <button
                    class="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors"
                    :class="
                      !sortKey
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    "
                    @click="
                      () => {
                        handleSort(null, null);
                        sortOpen = false;
                      }
                    "
                  >
                    <span>Default</span>
                    <Check
                      v-if="!sortKey"
                      class="h-3 w-3 text-primary shrink-0"
                    />
                  </button>
                  <button
                    v-for="opt in features.sortOptions"
                    :key="opt.key"
                    class="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors"
                    :class="
                      sortKey === opt.key
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    "
                    @click="cycleSort(opt.key)"
                  >
                    <span>{{ opt.label }}</span>
                    <span class="flex items-center shrink-0">
                      <ArrowUp
                        v-if="sortKey === opt.key && sortOrder === 'asc'"
                        class="h-3 w-3 text-primary"
                      />
                      <ArrowDown
                        v-else-if="sortKey === opt.key && sortOrder === 'desc'"
                        class="h-3 w-3 text-primary"
                      />
                    </span>
                  </button>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg"
            >
              {{ sortKey ? `Sorted: ${sortKey} (${sortOrder})` : "Sort items" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Divider -->
        <div class="w-px h-5 bg-border shrink-0 mx-0.5" />

        <!-- Density -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary hover:text-primary hover:bg-secondary"
                @click="cycleDensity"
              >
                <component :is="densityIcon" class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg capitalize"
            >
              {{ density }} density
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Copy as JSON -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary transition-all duration-200"
                @click="copyItems"
              >
                <CheckCheck v-if="copyDone" class="h-4 w-4" />
                <Copy v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg"
            >
              {{ copyDone ? "Copied!" : "Copy as JSON" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- Fullscreen -->
        <TooltipProvider :delay-duration="150">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg cursor-pointer text-primary transition-all duration-200"
                @click="isFullscreen = !isFullscreen"
              >
                <Minimize v-if="isFullscreen" class="h-4 w-4" />
                <Maximize v-else class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              :side-offset="6"
              class="text-xs rounded-lg"
            >
              {{ isFullscreen ? "Exit fullscreen" : "Fullscreen" }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- SCROLLABLE BODY                                                        -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <div
      ref="scrollContainer"
      class="overflow-y-auto flex-1 min-h-0"
      @scroll="onScroll"
    >
      <!-- ── Initial skeleton loading ──────────────────────────────────────── -->
      <template v-if="isInitialLoading">
        <div
          v-for="i in 7"
          :key="`sk-init-${i}`"
          :class="['border-b border-border last:border-b-0', itemPaddingClass]"
          :style="{ opacity: 1 - i * 0.1 }"
        >
          <slot name="skeleton" :index="i">
            <DefaultSkeleton />
          </slot>
        </div>
      </template>

      <!-- ── Error state ────────────────────────────────────────────────────── -->
      <template v-else-if="error">
        <div class="flex flex-col items-center gap-3 py-16 px-6">
          <div
            class="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"
          >
            <AlertCircle class="h-5 w-5 text-destructive" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-destructive">
              Failed to load items
            </p>
            <p class="text-xs text-muted-foreground mt-1">{{ error }}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="h-8 px-4 rounded-lg text-xs mt-1"
            @click="reload"
          >
            <RefreshCw class="h-3.5 w-3.5 mr-2" />
            Try again
          </Button>
        </div>
      </template>

      <!-- ── Empty state ────────────────────────────────────────────────────── -->
      <template v-else-if="isEmpty">
        <div class="flex flex-col items-center gap-3 py-16 px-6">
          <div
            class="w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center"
          >
            <List class="h-5 w-5 text-muted-foreground" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-foreground">No results found</p>
            <p class="text-xs text-muted-foreground mt-0.5">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      </template>

      <!-- ── Item list ──────────────────────────────────────────────────────── -->
      <template v-else>
        <template v-for="group in groupedItems" :key="group.key">
          <!-- Group header (sticky) -->
          <div
            v-if="group.label !== null"
            class="sticky top-0 z-10 flex items-center gap-2.5 px-5 py-2 bg-muted/95 backdrop-blur-sm border-b border-border cursor-pointer select-none"
            @click="toggleGroup(group.key)"
          >
            <div
              class="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
              :style="{
                boxShadow: '0 0 6px rgb(var(--color-primary) / 0.7)',
              }"
            />
            <span
              class="text-xs font-bold text-primary tracking-wider uppercase"
            >
              {{ group.label }}
            </span>
            <span
              class="text-[10px] font-mono text-muted-foreground bg-border/60 px-1.5 py-0.5 rounded-full"
            >
              {{ group.items.length }}
            </span>
            <ChevronDown
              class="h-3.5 w-3.5 text-muted-foreground ml-auto transition-transform duration-200"
              :class="collapsedGroups.has(group.key) ? '-rotate-90' : ''"
            />
          </div>

          <!-- Items in group -->
          <template v-if="!collapsedGroups.has(group.key)">
            <div
              v-for="(item, localIdx) in group.items"
              :key="resolveItemKey(item, localIdx)"
              class="border-b border-border last:border-b-0"
              :class="isNewItem(item, localIdx, group) ? 'list-item-enter' : ''"
            >
              <!-- ── Accordion trigger row ─────────────────────────────────── -->
              <div
                :class="[
                  itemPaddingClass,
                  'flex items-center justify-between hover:bg-accent cursor-pointer transition-colors duration-150 select-none group/row',
                ]"
                @click="toggleExpand(resolveItemKey(item, localIdx))"
              >
                <!-- Summary slot -->
                <div class="flex-1 min-w-0">
                  <slot
                    name="item-summary"
                    :item="item"
                    :index="localIdx"
                    :is-new="isNewItem(item, localIdx, group)"
                    :is-expanded="
                      expandedItems.has(resolveItemKey(item, localIdx))
                    "
                  >
                    <!-- Default summary if no slot provided -->
                    <span class="text-sm text-foreground truncate">
                      {{ getDefaultLabel(item) }}
                    </span>
                  </slot>
                </div>

                <!-- Expand chevron -->
                <div class="flex items-center gap-2 shrink-0 ml-3">
                  <slot name="item-actions" :item="item" :index="localIdx" />
                  <ChevronDown
                    class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 opacity-40 group-hover/row:opacity-100"
                    :class="
                      expandedItems.has(resolveItemKey(item, localIdx))
                        ? 'rotate-180 opacity-100'
                        : ''
                    "
                  />
                </div>
              </div>

              <!-- ── Accordion expanded panel ─────────────────────────────── -->
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
                  class="border-t border-border/50 bg-muted/30"
                >
                  <div :class="itemPaddingClass">
                    <slot name="item-expanded" :item="item" :index="localIdx">
                      <!-- Default expanded content: formatted JSON -->
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

        <!-- ── Infinite scroll sentinel ────────────────────────────────────── -->
        <div ref="sentinel" class="w-full">
          <!-- Load-more skeletons -->
          <template v-if="isLoadingMore">
            <div
              v-for="i in 4"
              :key="`sk-more-${i}`"
              :class="['border-b border-border', itemPaddingClass]"
              :style="{ opacity: 1 - i * 0.2 }"
            >
              <slot name="skeleton" :index="i">
                <DefaultSkeleton />
              </slot>
            </div>
          </template>

          <!-- End-of-list indicator -->
          <template v-else-if="!hasMore && loadedCount > 0">
            <div class="sticky bottom-0 z-10 bg-background">
              <div class="flex items-center gap-3 px-5 py-4">
                <div class="h-px flex-1 bg-border" />
                <span
                  class="text-[10px] font-mono text-muted-foreground uppercase tracking-widest shrink-0"
                >
                  {{ loadedCount }} item{{ loadedCount !== 1 ? "s" : "" }} total
                </span>
                <div class="h-px flex-1 bg-border" />
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Button from "@/components/ui/button/Button.vue";
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
  import { useIntersectionObserver } from "@vueuse/core";
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

  // ── Default skeleton sub-component (inline) ────────────────────────────────
  const DefaultSkeleton = defineComponent({
    setup() {
      return () =>
        h("div", { class: "flex items-center gap-3 animate-pulse" }, [
          h("div", {
            class: "h-10 w-10 rounded-xl bg-border/80 shrink-0",
          }),
          h("div", { class: "flex-1 space-y-2 py-0.5" }, [
            h("div", { class: "h-3 bg-border/80 rounded-full w-2/5" }),
            h("div", { class: "h-2.5 bg-border/60 rounded-full w-3/5" }),
          ]),
          h("div", {
            class: "h-2.5 bg-border/60 rounded-full w-14 shrink-0",
          }),
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
    /** Property name (or dot-path) used as the unique key. Defaults to 'id'. */
    itemKey?: string | ((item: any) => string | number);
  }

  const props = withDefaults(defineProps<Props>(), {
    config: () => ({}),
    itemKey: "id",
  });

  // ── Composable ─────────────────────────────────────────────────────────────

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
  } = useListInteractions(props.listId, props.fetchFn, props.config);

  // ── External search sync ───────────────────────────────────────────────────

  watch(
    () => props.externalSearch,
    (val) => {
      if (val !== undefined) handleSearch(val);
    },
  );

  // ── Fullscreen ─────────────────────────────────────────────────────────────

  const rootEl = ref<HTMLElement | null>(null);
  const isFullscreen = ref(false);

  // ── Scroll progress (position in scroll container, 0–100) ──────────────────

  const scrollContainer = ref<HTMLElement | null>(null);
  const scrollProgress = ref(0);

  function onScroll(): void {
    if (!scrollContainer.value) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
    const max = scrollHeight - clientHeight;
    scrollProgress.value = max > 0 ? (scrollTop / max) * 100 : 0;
  }

  // ── Infinite scroll sentinel ───────────────────────────────────────────────

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
    {
      root: scrollContainer,
      threshold: props.config?.sentinelThreshold ?? 0.1,
    },
  );

  // ── Accordion expand / collapse ────────────────────────────────────────────

  const expandedItems = ref<Set<string | number>>(new Set());

  function resolveItemKey(item: any, fallbackIndex: number): string | number {
    if (typeof props.itemKey === "function") return props.itemKey(item);
    const val = item?.[props.itemKey as string];
    return val != null ? val : `__idx_${fallbackIndex}`;
  }

  function toggleExpand(key: string | number): void {
    if (expandedItems.value.has(key)) {
      expandedItems.value.delete(key);
    } else {
      expandedItems.value.add(key);
    }
    // Trigger reactivity
    expandedItems.value = new Set(expandedItems.value);
  }

  // ── Group collapse ─────────────────────────────────────────────────────────

  const collapsedGroups = ref<Set<string>>(new Set());

  function toggleGroup(key: string): void {
    if (collapsedGroups.value.has(key)) {
      collapsedGroups.value.delete(key);
    } else {
      collapsedGroups.value.add(key);
    }
    collapsedGroups.value = new Set(collapsedGroups.value);
  }

  // ── New-item detection (for fade-in) ───────────────────────────────────────

  function isNewItem(item: any, localIdx: number, group: ListGroup): boolean {
    // Map local group index → global loaded index
    const globalOffset = loadedItems.value.indexOf(group.items[localIdx]);
    return newItemIndexes.value.has(globalOffset);
  }

  // ── Default label fallback ─────────────────────────────────────────────────

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
    if (density.value === "compact") return "px-5 py-2";
    if (density.value === "comfortable") return "px-5 py-5";
    return "px-5 py-3.5";
  });

  // ── Copy as JSON ───────────────────────────────────────────────────────────

  const copyDone = ref(false);

  function copyItems(): void {
    const json = JSON.stringify(loadedItems.value, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      copyDone.value = true;
      setTimeout(() => (copyDone.value = false), 2000);
    });
  }

  // ── Sort cycling ───────────────────────────────────────────────────────────

  const sortOpen = ref(false);

  function cycleSort(key: string): void {
    let order: ListSortOrder;

    if (sortKey.value !== key) {
      order = "asc";
    } else if (sortOrder.value === "asc") {
      order = "desc";
    } else {
      // desc → reset
      handleSort(null, null);
      sortOpen.value = false;
      return;
    }

    handleSort(key, order);
    sortOpen.value = false;
  }

  // ── Group by UI ────────────────────────────────────────────────────────────

  const groupByOpen = ref(false);

  // ── Expose public surface ──────────────────────────────────────────────────

  defineExpose({ refresh: reload, loadMore });
</script>

<style scoped>
  /* Fade-in animation for newly loaded items */
  .list-item-enter {
    animation: listItemReveal 0.4s ease-out both;
  }

  @keyframes listItemReveal {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
