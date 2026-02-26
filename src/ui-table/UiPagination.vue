<template>
  <div class="pagination-shell flex select-none flex-col gap-3 rounded-xl border border-border/60 bg-background/70 px-2.5 py-2.5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
    <div class="info-block">
      <div v-if="total > 0" class="info-inner">
        <span class="info-badge">{{ startItem }}–{{ endItem }}</span>
        <span class="info-divider" />
        <span class="info-text">{{ total }} Total</span>
      </div>
      <span v-else class="info-text">No results</span>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="rows-control">
        <span class="rows-label">Rows</span>
        <Select
          :model-value="String(perPage)"
          @update:model-value="handlePerPageChange"
        >
          <SelectTrigger class="rows-trigger text-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
            <SelectValue class="font-medium text-foreground" />
          </SelectTrigger>
          <SelectContent class="rows-content">
            <SelectItem
              v-for="size in pageSizes"
              :key="size"
              :value="String(size)"
              class="rows-item"
            >
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="rule" />

      <div class="segment">
        <div class="segment-glow" :style="glowStyle" />
        <div class="segment-pill" :style="pillStyle" />

        <button
          class="seg-btn"
          :disabled="currentPage === 1"
          title="First page"
          @click="emitPageChange(1)"
        >
          <ChevronsLeft class="h-3.5 w-3.5" />
        </button>

        <button
          class="seg-btn"
          :disabled="currentPage === 1"
          title="Previous page"
          @click="emitPageChange(currentPage - 1)"
        >
          <ChevronLeft class="h-3.5 w-3.5" />
        </button>

        <div class="seg-rule" />

        <div class="seg-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            :ref="(el) => captureRef(el, page)"
            class="seg-page"
            :class="{ 'seg-page--on': page === currentPage }"
            @click="emitPageChange(page)"
          >
            {{ page }}
          </button>
        </div>

        <div class="seg-rule" />

        <button
          class="seg-btn"
          :disabled="currentPage === totalPages"
          title="Next page"
          @click="emitPageChange(currentPage + 1)"
        >
          <ChevronRight class="h-3.5 w-3.5" />
        </button>

        <button
          class="seg-btn"
          :disabled="currentPage === totalPages"
          title="Last page"
          @click="emitPageChange(totalPages)"
        >
          <ChevronsRight class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-vue-next";
import { computed, nextTick, ref, watch, type CSSProperties } from "vue";

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  pageSizes?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [5, 10, 20, 50, 100],
});

const emit = defineEmits<{
  "page-change": [page: number];
  "per-page-change": [perPage: number];
}>();

const startItem = computed(() =>
  props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1,
);
const endItem = computed(() =>
  Math.min(props.currentPage * props.perPage, props.total),
);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit("page-change", page);
  }
}

function handlePerPageChange(value: string | number | null) {
  emit("per-page-change", Number(value ?? props.perPage));
}

const pageRefs = ref<Record<number, HTMLElement>>({});
const pillStyle = ref<CSSProperties>({
  width: "0px",
  transform: "translateX(0px)",
  opacity: "0",
});
const glowStyle = ref<CSSProperties>({
  width: "0px",
  transform: "translateX(0px)",
  opacity: "0",
});

function captureRef(el: unknown, page: number) {
  if (el instanceof HTMLElement) {
    pageRefs.value[page] = el;
  }
}

async function updatePill() {
  await nextTick();
  const el = pageRefs.value[props.currentPage];
  if (!el) {
    return;
  }

  const wrap = el.closest(".seg-pages");
  if (!(wrap instanceof HTMLElement)) {
    return;
  }

  const wrapRect = wrap.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const x = elRect.left - wrapRect.left;
  const w = elRect.width;

  pillStyle.value = {
    width: `${w}px`,
    transform: `translateX(${x}px)`,
    opacity: "1",
  };

  glowStyle.value = {
    width: `${w + 16}px`,
    transform: `translateX(${x - 8}px)`,
    opacity: "1",
  };
}

watch(
  () => [props.currentPage, visiblePages.value],
  updatePill,
  { immediate: true, deep: true },
);
</script>

<style scoped>
.pagination-shell {
  box-shadow:
    0 1px 0 hsl(var(--background) / 0.9) inset,
    0 16px 32px -22px hsl(var(--foreground) / 0.35);
}

.info-block {
  display: inline-flex;
  align-items: center;
}

.info-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.28rem 0.72rem;
  border-radius: 9999px;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--muted) / 0.35);
}

.info-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  padding: 0.08rem 0.45rem;
  border-radius: 9999px;
}

.info-divider {
  width: 1px;
  height: 0.72rem;
  border-radius: 9999px;
  background: hsl(var(--border));
  opacity: 0.55;
}

.info-text {
  font-size: 0.68rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground) / 0.78);
}

.rows-control {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
}

.rows-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground) / 0.58);
}

.rows-trigger {
  height: 1.85rem;
  width: 3.7rem;
  padding: 0 0.45rem;
  border-radius: 0.55rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--background));
  box-shadow: inset 0 1px 0 hsl(var(--background) / 0.9);
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.rows-trigger:hover,
.rows-trigger[data-state="open"] {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--accent) / 0.5);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.08);
}

.rows-content {
  border-radius: 0.7rem;
  border: 1px solid hsl(var(--border) / 0.65);
  background: hsl(var(--popover) / 0.98);
  box-shadow:
    0 0 0 1px hsl(var(--primary) / 0.04),
    0 12px 30px -8px rgba(0, 0, 0, 0.18);
}

.rows-item {
  border-radius: 0.45rem;
  font-size: 0.72rem;
}

.rule {
  width: 1px;
  height: 1.1rem;
  border-radius: 9999px;
  background: linear-gradient(
    to bottom,
    transparent,
    hsl(var(--border) / 0.7) 30%,
    hsl(var(--border) / 0.7) 70%,
    transparent
  );
}

.segment {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.22rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.62);
  background: hsl(var(--muted) / 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(0, 0, 0, 0.06);
}

.segment-glow {
  position: absolute;
  top: 50%;
  left: 0;
  translate: 0 -50%;
  height: 112%;
  border-radius: 9999px;
  background: radial-gradient(ellipse at center, hsl(var(--primary) / 0.24) 0%, transparent 72%);
  filter: blur(6px);
  pointer-events: none;
  transition: transform 320ms cubic-bezier(0.2, 0.9, 0.28, 1), width 260ms ease, opacity 180ms ease;
  z-index: 0;
}

.segment-pill {
  position: absolute;
  top: 0.22rem;
  left: 0;
  height: calc(100% - 0.44rem);
  border-radius: 0.45rem;
  background: hsl(var(--primary));
  box-shadow:
    0 2px 10px hsl(var(--primary) / 0.45),
    0 1px 3px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  pointer-events: none;
  transition: transform 280ms cubic-bezier(0.2, 0.9, 0.28, 1), width 220ms ease, opacity 160ms ease;
  z-index: 1;
}

.seg-btn {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  width: 1.75rem;
  border-radius: 0.45rem;
  border: none;
  background: transparent;
  color: hsl(var(--muted-foreground) / 0.58);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease, transform 110ms ease;
}

.seg-btn:hover:not(:disabled) {
  background: hsl(var(--background) / 0.9);
  color: hsl(var(--foreground));
}

.seg-btn:active:not(:disabled) {
  transform: scale(0.9);
  color: hsl(var(--primary));
}

.seg-btn:disabled {
  opacity: 0.24;
  cursor: not-allowed;
}

.seg-rule {
  width: 1px;
  align-self: stretch;
  margin: 0.1rem 0.14rem;
  background: linear-gradient(
    to bottom,
    transparent,
    hsl(var(--border) / 0.5) 30%,
    hsl(var(--border) / 0.5) 70%,
    transparent
  );
}

.seg-pages {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
}

.seg-page {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  min-width: 1.75rem;
  padding: 0 0.3rem;
  border-radius: 0.45rem;
  border: none;
  background: transparent;
  color: hsl(var(--muted-foreground) / 0.68);
  font-size: 0.72rem;
  font-weight: 550;
  cursor: pointer;
  transition: color 150ms ease, transform 100ms ease;
}

.seg-page:hover:not(.seg-page--on) {
  color: hsl(var(--foreground));
}

.seg-page:active:not(.seg-page--on) {
  transform: scale(0.88);
}

.seg-page--on {
  color: hsl(var(--primary-foreground));
  font-weight: 700;
  cursor: default;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}
</style>
