<template>
  <div
    class="kb3-root flex flex-col"
    :class="
      isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'relative h-full'
    "
    style="background: rgb(var(--color-background))"
  >
    <!-- ══════════════════════════════════════════════
         TOOLBAR — subtle ambient strip
    ══════════════════════════════════════════════ -->
    <div class="shrink-0 flex items-center gap-1.5 px-5 h-11">
      <div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="kb3-btn"
              @click="collapseAll"
              title="Collapse all"
            >
              <ChevronsLeft class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="text-xs"
            >Collapse all</TooltipContent
          >
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <button type="button" class="kb3-btn" @click="expandAll">
              <ChevronsRight class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="text-xs"
            >Expand all</TooltipContent
          >
        </Tooltip>
        <div class="w-px h-3 bg-border/60 mx-0.5" />
        <Tooltip>
          <TooltipTrigger as-child>
            <button type="button" class="kb3-btn" @click="cycleDensity">
              <Rows4 v-if="density === 'compact'" class="h-3.5 w-3.5" />
              <Rows3 v-else-if="density === 'default'" class="h-3.5 w-3.5" />
              <Rows2 v-else class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="text-xs">Density</TooltipContent>
        </Tooltip>
      </div>

      <div class="flex-1" />

      <!-- Search result float -->
      <Transition name="kb3-pop">
        <div
          v-if="searchQuery && searchQuery.trim()"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/20 text-[11px]"
        >
          <Search class="w-3 h-3 text-primary" />
          <span class="font-bold text-foreground">{{ searchResultCount }}</span>
          <span class="text-muted-foreground">results</span>
        </div>
      </Transition>

      <div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50">
        <Tooltip>
          <TooltipTrigger as-child>
            <button type="button" class="kb3-btn" @click="refresh">
              <RefreshCw
                class="h-3.5 w-3.5"
                :class="refreshing ? 'animate-spin text-primary' : ''"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="text-xs">Refresh</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="kb3-btn"
              @click="isFullscreen = !isFullscreen"
            >
              <Shrink v-if="isFullscreen" class="h-3.5 w-3.5" />
              <Expand v-else class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="text-xs">{{
            isFullscreen ? "Exit" : "Fullscreen"
          }}</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         BOARD
    ══════════════════════════════════════════════ -->
    <div
      class="flex-1 min-h-0 flex gap-4 px-5 py-3 pb-5 overflow-x-auto items-start kb3-board"
    >
      <template v-for="(stage, si) in stages" :key="stage.value">
        <!-- ── Collapsed strip ── -->
        <div
          v-if="collapsedStages.has(stage.value)"
          class="kb3-col-collapsed shrink-0 w-10 flex flex-col items-center rounded-2xl cursor-pointer transition-all duration-200 self-stretch overflow-hidden"
          :style="{
            background: `${stageColor(si)}0d`,
            border: `1.5px solid ${stageColor(si)}25`,
          }"
          @click="toggleStage(stage.value)"
          @mouseenter="
            (e) =>
              ((e.currentTarget as HTMLElement).style.background =
                `${stageColor(si)}18`)
          "
          @mouseleave="
            (e) =>
              ((e.currentTarget as HTMLElement).style.background =
                `${stageColor(si)}0d`)
          "
        >
          <div
            class="w-6 h-1 rounded-b-full mx-auto mt-0 mb-0"
            :style="{ background: stageColor(si) }"
          />
          <div class="flex flex-col items-center gap-2.5 py-4 flex-1">
            <component
              :is="stageIcon(si)"
              class="w-3.5 h-3.5 shrink-0"
              :style="{ color: stageColor(si) }"
            />
            <span
              class="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
              :style="{
                color: stageColor(si),
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }"
              >{{ stage.label }}</span
            >
            <div
              class="mt-auto mb-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
              :style="{ background: stageColor(si) }"
            >
              {{ col(stage.value).items.length }}
            </div>
          </div>
        </div>

        <!-- ── Expanded column ── -->
        <div
          v-else
          class="kb3-col flex flex-col rounded-md overflow-hidden border"
          :style="{
            '--ks': stageColor(si),
            background: `${stageColor(si)}08`,
            transition:
              'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
            transform:
              isDragging && dragOverStage === stage.value
                ? 'scale(1.006)'
                : 'scale(1)',
          }"
          @dragenter.prevent="dragOverStage = stage.value"
        >
          <!-- Column header — floating feel -->
          <div class="shrink-0 px-4 pt-4 pb-3.5">
            <div class="flex items-center gap-2.5 pb-4 border-b">
              <!-- Icon bubble -->
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                :style="{
                  background: `linear-gradient(135deg, ${stageColor(si)}30, ${stageColor(si)}18)`,
                  color: stageColor(si),
                  border: `1px solid ${stageColor(si)}30`,
                }"
              >
                <component :is="stageIcon(si)" class="w-4 h-4" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-[13px] font-bold text-foreground tracking-tight truncate"
                    >{{ stage.label }}</span
                  >
                  <Loader2
                    v-if="col(stage.value).loading"
                    class="w-3 h-3 text-muted-foreground animate-spin shrink-0"
                  />
                  <div
                    v-else
                    class="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-black"
                    :style="{
                      background: `${stageColor(si)}22`,
                      color: stageColor(si),
                    }"
                  >
                    {{ col(stage.value).items.length }}
                  </div>
                  <Badge
                    v-if="stage.wipLimit"
                    :variant="
                      col(stage.value).items.length >= stage.wipLimit
                        ? 'destructive'
                        : 'outline'
                    "
                    class="text-[9px] h-4 px-1.5 font-extrabold uppercase shrink-0"
                    >{{ col(stage.value).items.length }}/{{
                      stage.wipLimit
                    }}</Badge
                  >
                </div>
                <p
                  v-if="
                    searchQuery &&
                    searchQuery.trim() &&
                    filteredItems(stage.value).length !==
                      col(stage.value).items.length
                  "
                  class="text-[10px] text-muted-foreground/60 mt-0.5"
                >
                  {{ filteredItems(stage.value).length }} of
                  {{ col(stage.value).items.length }} shown
                </p>
              </div>

              <div
                class="flex items-center gap-0.5 opacity-40 hover:opacity-100 transition-opacity"
              >
                <button class="kb3-btn-sm" @click="loadColumn(stage.value)">
                  <RotateCw class="w-3 h-3" />
                </button>
                <button class="kb3-btn-sm" @click="toggleStage(stage.value)">
                  <PanelLeftClose class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Card scroll area — transparent bg continues the column color -->
          <div class="flex-1 min-h-0 overflow-y-auto px-3 pb-2 kb3-scroll">
            <draggable
              :model-value="filteredItems(stage.value)"
              :item-key="itemKey"
              group="kanban"
              :animation="200"
              ghost-class="kb3-ghost"
              chosen-class="kb3-chosen"
              drag-class="kb3-dragging"
              :disabled="
                features?.dragDrop === false || col(stage.value).loading
              "
              :data-stage="stage.value"
              class="flex flex-col gap-2 min-h-13 rounded-xl"
              :class="isDragging ? 'kb3-dropzone-active' : ''"
              :style="{
                paddingBottom: isDragging ? '88px' : '2px',
                transition: 'padding-bottom 0.2s ease',
              }"
              @update:model-value="(v) => setItems(stage.value, v)"
              @start="(_e) => onDragStart(stage.value)"
              @end="onDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="kb3-card-wrap group/card3"
                  :class="
                    landingCard !== null && landingCard.id === element[itemKey]
                      ? 'kb3-land'
                      : ''
                  "
                  :style="{ '--ks': stageColor(si) }"
                >
                  <div
                    class="kb3-card relative rounded-xl bg-background cursor-grab active:cursor-grabbing"
                    :class="densityPadding"
                  >
                    <!-- Hover glow -->
                    <div
                      class="kb3-glow"
                      :style="{
                        background: `radial-gradient(ellipse at 20% 50%, ${stageColor(si)}12, transparent 70%)`,
                      }"
                    />

                    <!-- Card actions slot -->
                    <div
                      v-if="$slots['card-actions']"
                      class="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover/card3:opacity-100 transition-opacity duration-150"
                      @click.stop
                      @mousedown.stop
                      @pointerdown.stop
                    >
                      <slot
                        name="card-actions"
                        :item="element"
                        :stage="stage.value"
                        :stage-meta="stage"
                      />
                    </div>

                    <div class="pl-3">
                      <slot
                        name="card"
                        :item="element"
                        :stage="stage.value"
                        :stage-meta="stage"
                      >
                        <p
                          class="text-sm font-semibold text-foreground truncate"
                        >
                          {{ element.name ?? element[itemKey] }}
                        </p>
                      </slot>
                    </div>
                  </div>
                </div>
              </template>

              <template #header>
                <div
                  v-if="col(stage.value).loading"
                  class="flex flex-col gap-2 mb-1"
                >
                  <div
                    v-for="n in 3"
                    :key="n"
                    class="rounded-xl bg-background/50 border border-border/20 animate-pulse"
                    :style="{
                      height:
                        density === 'compact'
                          ? '54px'
                          : density === 'comfortable'
                            ? '90px'
                            : '72px',
                      animationDelay: `${n * 80}ms`,
                    }"
                  />
                </div>
              </template>

              <template #footer>
                <Transition name="kb3-fade">
                  <div
                    v-if="
                      !col(stage.value).loading &&
                      filteredItems(stage.value).length === 0 &&
                      !col(stage.value).error
                    "
                    class="flex flex-col items-center gap-3 py-12 px-4 mb-1.5 rounded-2xl"
                    :style="{
                      background: `${stageColor(si)}06`,
                      border: `1.5px dashed ${stageColor(si)}25`,
                    }"
                  >
                    <div
                      class="w-11 h-11 rounded-2xl flex items-center justify-center"
                      :style="{
                        background: `${stageColor(si)}15`,
                        color: stageColor(si),
                      }"
                    >
                      <component :is="stageIcon(si)" class="w-5 h-5" />
                    </div>
                    <div class="text-center">
                      <p
                        class="text-[11px] font-semibold text-muted-foreground/60"
                      >
                        {{
                          searchQuery && searchQuery.trim()
                            ? "No matches found"
                            : "Nothing here yet"
                        }}
                      </p>
                      <p
                        v-if="!(searchQuery && searchQuery.trim())"
                        class="text-[10px] text-muted-foreground/40 mt-0.5"
                      >
                        Drop a card or add a new task
                      </p>
                    </div>
                  </div>
                </Transition>

                <div
                  v-if="col(stage.value).error"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2 bg-destructive/5 border border-destructive/15"
                >
                  <AlertCircle class="w-3.5 h-3.5 text-destructive shrink-0" />
                  <p
                    class="text-[11px] text-destructive font-medium flex-1 truncate"
                  >
                    {{ col(stage.value).error }}
                  </p>
                  <button
                    type="button"
                    class="text-[10px] font-bold text-destructive hover:underline shrink-0"
                    @click="loadColumn(stage.value)"
                  >
                    Retry
                  </button>
                </div>

                <!-- Add button — colored with stage accent -->
                <button
                  type="button"
                  class="kb3-add-btn group/add3"
                  :style="{ '--ks': stageColor(si) }"
                >
                  <div class="kb3-add-icon-wrap">
                    <Plus
                      class="w-3.5 h-3.5 transition-transform duration-200 group-hover/add3:rotate-90"
                    />
                  </div>
                  <span>Add task</span>
                </button>

                <slot
                  name="column-footer"
                  :stage="stage.value"
                  :stage-meta="stage"
                />
              </template>
            </draggable>
          </div>

          <slot name="column-action" :stage="stage.value" :stage-meta="stage" />
        </div>
      </template>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="T extends { id: number | string; [key: string]: any }"
>
  import { computed, reactive, ref, watch } from "vue";
  import draggable from "vuedraggable";

  import Badge from "@/components/ui/badge/Badge.vue";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip";

  import {
    AlertCircle,
    CheckCircle2,
    ChevronsLeft,
    ChevronsRight,
    CircleCheck,
    ClipboardList,
    Expand,
    Loader2,
    PanelLeftClose,
    Plus,
    RefreshCw,
    RotateCw,
    Rows2,
    Rows3,
    Rows4,
    Search,
    Settings2,
    Shrink,
    Zap,
  } from "lucide-vue-next";

  import type { Component } from "vue";
  import type {
    KanbanBoardFetchFn,
    KanbanBoardFetchParams,
    KanbanConfig,
    KanbanFeatures,
    KanbanMoveEvent,
    KanbanReorderEvent,
    KanbanStageDefinition,
  } from "./types/kanban.types";
  import type {
    UniversalApiResponse,
    UniversalFetchParams,
  } from "./types/universal.types";
import Separator from "@/components/ui/separator/Separator.vue";

  interface SortableEvent {
    from: Element;
    to: Element;
    newIndex: number;
    oldIndex: number;
  }
  interface ColumnState {
    items: unknown[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
    total: number;
  }
  interface Props {
    stages: KanbanStageDefinition[];
    boardFetchFn?: KanbanBoardFetchFn<T>;
    fetchFn: (params: UniversalFetchParams) => Promise<UniversalApiResponse<T>>;
    config?: KanbanConfig;
    features?: KanbanFeatures;
    itemKey?: string;
    searchQuery?: string;
    externalFilter?: Record<string, any> | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    itemKey: "id",
    searchQuery: "",
    features: () => ({ dragDrop: true, intraStageReorder: true }),
  });
  const emit = defineEmits<{
    (e: "move", event: KanbanMoveEvent<T>): void;
    (e: "reorder", event: KanbanReorderEvent): void;
  }>();

  const columnData = reactive<Record<string, ColumnState>>({});
  function col(sv: string): ColumnState {
    if (!columnData[sv]) {
      columnData[sv] = {
        items: [],
        loading: false,
        error: null,
        hasMore: false,
        currentPage: 1,
        totalPages: 1,
        total: 0,
      };
    }
    return columnData[sv] as ColumnState;
  }
  function colItems(sv: string): T[] {
    return col(sv).items as T[];
  }
  function setItems(sv: string, items: T[]): void {
    col(sv).items = items as unknown[];
  }
  function markAllLoading(): void {
    for (const st of props.stages) {
      const c = col(st.value);
      c.loading = true;
      c.error = null;
    }
  }

  async function boardLoad(): Promise<void> {
    if (!props.boardFetchFn) {
      await perColumnLoad();
      return;
    }
    markAllLoading();
    try {
      const res = await props.boardFetchFn({
        search: props.searchQuery ?? "",
        perPage: props.config?.perPage ?? 50,
        filters: props.externalFilter ?? undefined,
      } satisfies KanbanBoardFetchParams);
      for (const st of props.stages) {
        const c = col(st.value);
        const payload = res.data[st.value];
        if (payload) {
          c.items = (payload.data ?? []) as unknown[];
          c.currentPage = payload.meta.current_page;
          c.totalPages = payload.meta.last_page;
          c.total = payload.meta.total;
          c.hasMore = payload.meta.current_page < payload.meta.last_page;
        } else {
          c.items = [];
          c.currentPage = 1;
          c.totalPages = 1;
          c.total = 0;
          c.hasMore = false;
        }
        c.loading = false;
        c.error = null;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Failed to load board";
      for (const st of props.stages) {
        const c = col(st.value);
        c.loading = false;
        c.error = msg;
      }
    }
  }

  async function loadColumn(sv: string): Promise<void> {
    const c = col(sv);
    c.loading = true;
    c.error = null;
    try {
      const r = await props.fetchFn({
        page: 1,
        perPage: props.config?.perPage ?? 50,
        search: props.searchQuery ?? "",
        sortBy: null,
        sortOrder: null,
        kanbanStage: sv,
        filters: props.externalFilter ?? undefined,
      });
      c.items = Array.isArray(r.data) ? (r.data as unknown[]) : [];
      c.currentPage = r.meta.current_page;
      c.totalPages = r.meta.last_page;
      c.total = r.meta.total;
      c.hasMore = r.meta.current_page < r.meta.last_page;
      c.loading = false;
    } catch (err: any) {
      c.error =
        err?.response?.data?.message ?? err?.message ?? "Failed to load.";
      c.loading = false;
    }
  }

  async function appendColumn(sv: string): Promise<void> {
    const c = col(sv);
    if (!c.hasMore || c.loading) return;
    c.loading = true;
    try {
      const r = await props.fetchFn({
        page: c.currentPage + 1,
        perPage: props.config?.perPage ?? 50,
        search: props.searchQuery ?? "",
        sortBy: null,
        sortOrder: null,
        kanbanStage: sv,
        filters: props.externalFilter ?? undefined,
      });
      c.items = [...c.items, ...(r.data as unknown[])];
      c.currentPage = r.meta.current_page;
      c.totalPages = r.meta.last_page;
      c.hasMore = r.meta.current_page < r.meta.last_page;
      c.loading = false;
    } catch (err: any) {
      c.error =
        err?.response?.data?.message ?? err?.message ?? "Failed to load more.";
      c.loading = false;
    }
  }

  async function perColumnLoad(): Promise<void> {
    markAllLoading();
    await Promise.all(props.stages.map((st) => loadColumn(st.value)));
  }
  async function loadAll(): Promise<void> {
    if (props.boardFetchFn) {
      await boardLoad();
    } else {
      await perColumnLoad();
    }
  }

  watch(
    () => props.stages,
    (stages: KanbanStageDefinition[]) => {
      if (stages.length === 0) return;
      const alreadyLoaded = stages.some((st) => {
        const c = col(st.value);
        return c.items.length > 0 || c.loading;
      });
      if (!alreadyLoaded) loadAll();
    },
    { immediate: true },
  );

  let reloadTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleReload(): void {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => loadAll(), props.config?.debounceMs ?? 400);
  }
  watch(() => props.searchQuery, scheduleReload);
  watch(() => props.externalFilter, scheduleReload, { deep: true });

  function filteredItems(sv: string): T[] {
    const q = (props.searchQuery ?? "").trim().toLowerCase();
    if (!q) return colItems(sv);
    return colItems(sv).filter((item) =>
      Object.values(item as Record<string, unknown>).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }
  const searchResultCount = computed<number>(() =>
    props.stages.reduce((n, s) => n + filteredItems(s.value).length, 0),
  );

  type Density = "compact" | "default" | "comfortable";
  const density = ref<Density>("default");
  const isFullscreen = ref<boolean>(false);
  const collapsedStages = ref<Set<string>>(new Set<string>());
  const isDragging = ref<boolean>(false);
  const dragOverStage = ref<string | null>(null);
  const landingCard = ref<{ id: string | number } | null>(null);
  const refreshing = ref<boolean>(false);

  const densityPadding = computed<string>(
    () =>
      ({
        compact: "px-3 py-2.5",
        default: "px-3.5 py-3.5",
        comfortable: "px-4 py-5",
      })[density.value],
  );
  function cycleDensity(): void {
    const order: Density[] = ["compact", "default", "comfortable"];
    density.value = order[(order.indexOf(density.value) + 1) % order.length];
  }
  function toggleStage(sv: string): void {
    const next = new Set(collapsedStages.value);
    next.has(sv) ? next.delete(sv) : next.add(sv);
    collapsedStages.value = next;
  }
  function collapseAll(): void {
    collapsedStages.value = new Set(props.stages.map((s) => s.value));
  }
  function expandAll(): void {
    collapsedStages.value = new Set<string>();
  }

  const colors = [
    "#7c6ff7",
    "#f6a623",
    "#34c789",
    "#4a9eff",
    "#ff6b9d",
    "#a855f7",
    "#00c4cc",
    "#8bc34a",
  ];
  function stageColor(i: number): string {
    const st = props.stages[i];
    if (st?.dot?.includes("red") || st?.dot?.includes("destruct"))
      return "#ff5757";
    return colors[i % colors.length];
  }
  const iconList: Component[] = [
    ClipboardList,
    Zap,
    Settings2,
    CheckCircle2,
    CircleCheck,
  ];
  function stageIcon(i: number): Component {
    return iconList[i % iconList.length];
  }

  let dragFromStage: string | null = null;
  function onDragStart(sv: string): void {
    dragFromStage = sv;
    isDragging.value = true;
    dragOverStage.value = sv;
  }
  function onDragEnd(ev: SortableEvent): void {
    const from = ev.from.getAttribute("data-stage") ?? dragFromStage;
    const to = ev.to.getAttribute("data-stage") ?? from;
    dragFromStage = null;
    isDragging.value = false;
    if (to) {
      const dropped = colItems(to)[ev.newIndex];
      if (dropped) {
        landingCard.value = { id: dropped[props.itemKey] as string | number };
        setTimeout(() => {
          landingCard.value = null;
        }, 400);
      }
    }
    dragOverStage.value = null;
    if (!from || !to) return;
    if (from !== to) {
      const moved = colItems(to)[ev.newIndex];
      if (!moved) return;
      const stageMeta = props.stages.find((s) => s.value === to);
      if (stageMeta?.wipLimit && colItems(to).length > stageMeta.wipLimit) {
        loadColumn(from);
        loadColumn(to);
        return;
      }
      emit("move", {
        item: moved,
        fromStage: from,
        toStage: to,
        newIndex: ev.newIndex,
      });
    } else if (props.features?.intraStageReorder !== false) {
      emit("reorder", {
        stage: to,
        orderedIds: colItems(to).map(
          (i) => i[props.itemKey] as string | number,
        ),
      });
    }
  }

  const totalItems = computed<number>(() =>
    props.stages.reduce((n, s) => n + colItems(s.value).length, 0),
  );
  const columnCounts = computed<Record<string, number>>(() => {
    const c: Record<string, number> = {};
    for (const s of props.stages) c[s.value] = colItems(s.value).length;
    return c;
  });
  function refreshColumn(sv: string): void {
    loadColumn(sv);
  }
  async function refresh(): Promise<void> {
    refreshing.value = true;
    await loadAll();
    refreshing.value = false;
  }
  async function loadMore(sv: string): Promise<void> {
    await appendColumn(sv);
  }
  defineExpose({ refresh, refreshColumn, loadMore, columnCounts, totalItems });
</script>

<style scoped>
  .kb3-board {
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--color-border)) transparent;
  }
  .kb3-scroll {
    scrollbar-width: none;
  }
  .kb3-col {
    flex: 1 0 272px;
    max-width: 355px;
    height: 100%;
    max-height: calc(100vh - 7.5rem);
  }
  .kb3-col-collapsed {
    min-height: 160px;
  }

  /* Buttons */
  .kb3-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    color: rgb(var(--color-muted-foreground));
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
  .kb3-btn:hover {
    background: rgb(var(--color-background));
    color: rgb(var(--color-foreground));
  }
  .kb3-btn-sm {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    color: rgb(var(--color-muted-foreground));
    transition: background 0.15s ease;
  }
  .kb3-btn-sm:hover {
    background: rgb(var(--color-muted));
  }

  /* Card */

  .kb3-card {
    border: 0.1px solid rgb(var(--color-border));
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.03);
    transition:
      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .kb3-card-wrap:hover .kb3-card {
    transform: translateY(-3px);
    box-shadow:
      0 10px 24px -6px rgba(0, 0, 0, 0.1),
      0 4px 10px -4px rgba(0, 0, 0, 0.06);
  }

  /* Hover glow overlay */
  .kb3-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
  }
  .kb3-card-wrap:hover .kb3-glow {
    opacity: 1;
  }

  /* Add button with icon bubble */
  .kb3-add-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    padding: 8px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: rgb(var(--color-muted-foreground) / 0.55);
    background: transparent;
    cursor: pointer;
    transition:
      color 0.15s ease,
      background 0.15s ease;
  }
  .kb3-add-btn:hover {
    color: var(--ks);
    background: color-mix(in srgb, var(--ks) 6%, transparent);
  }
  .kb3-add-icon-wrap {
    width: 22px;
    height: 22px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(var(--color-muted) / 0.6);
    transition:
      background 0.15s ease,
      color 0.15s ease;
    flex-shrink: 0;
  }
  .kb3-add-btn:hover .kb3-add-icon-wrap {
    background: color-mix(in srgb, var(--ks) 15%, transparent);
    color: var(--ks);
  }

  /* Dropzone */
  .kb3-dropzone-active {
    background-image: radial-gradient(
      circle,
      rgba(0, 0, 0, 0.06) 1px,
      transparent 1px
    );
    background-size: 16px 16px;
  }

  /* Drag states */
  .kb3-ghost {
    opacity: 0.3 !important;
    background: rgb(var(--color-muted)) !important;
    border: 2px dashed rgb(var(--color-border) / 0.7) !important;
    border-radius: 12px !important;
    box-shadow: none !important;
  }
  .kb3-ghost > * {
    opacity: 0 !important;
  }

  .kb3-chosen {
    opacity: 0.97 !important;
    transform: scale(1.018) translateY(-3px) !important;
    cursor: grabbing !important;
    z-index: 200 !important;
    border-radius: 12px !important;
  }

  .kb3-dragging {
    transform: scale(0.975) translateY(-6px) rotate(5deg) !important;
    opacity: 0.92 !important;
    z-index: 9999 !important;
    cursor: grabbing !important;
    border-radius: 10px !important;
    transition: none !important;
  }

  @keyframes kb3-settle {
    0% {
      transform: translateY(-7px) scale(1.03) rotate(2deg);
    }
    50% {
      transform: translateY(2px) scale(0.99) rotate(-0.5deg);
    }
    100% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
  }
  .kb3-land {
    animation: kb3-settle 0.38s cubic-bezier(0.34, 1.6, 0.64, 1) forwards !important;
  }

  /* Transitions */
  .kb3-fade-enter-active,
  .kb3-fade-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .kb3-fade-enter-from,
  .kb3-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }
  .kb3-pop-enter-active {
    transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  .kb3-pop-leave-active {
    transition: all 0.15s ease;
  }
  .kb3-pop-enter-from,
  .kb3-pop-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }
</style>
