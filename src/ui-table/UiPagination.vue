<template>
  <div
    class="pagination-shell flex flex-col gap-3 rounded-xl border border-border/50 bg-background/85 px-2 py-2 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center">
      <div v-if="total > 0" class="meta-chip">
        <span class="meta-range">{{ startItem }}–{{ endItem }}</span>
        <span class="meta-sep" />
        <span class="meta-total">{{ total }} total</span>
      </div>
      <span v-else class="text-xs font-medium tracking-wide text-muted-foreground/80"
        >No results</span
      >
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <div class="rows-wrap">
        <span class="rows-label">Rows</span>
        <Select
          :model-value="String(perPage)"
          @update:model-value="handlePerPageChange"
        >
          <SelectTrigger
            class="rows-trigger focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <SelectValue class="font-semibold text-foreground" />
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

      <div class="mini-rule" />

      <div class="segmented-nav">
        <div class="seg-glow" :style="glowStyle" />
        <div class="seg-pill" :style="pillStyle" />

        <button
          class="seg-arrow"
          :disabled="currentPage === 1"
          title="First page"
          @click="emitPageChange(1)"
        >
          <ChevronsLeft class="h-3.5 w-3.5" />
        </button>

        <button
          class="seg-arrow"
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
            :class="{ 'seg-page--active': page === currentPage }"
            @click="emitPageChange(page)"
          >
            {{ page }}
          </button>
        </div>

        <div class="seg-rule" />

        <button
          class="seg-arrow"
          :disabled="currentPage === totalPages"
          title="Next page"
          @click="emitPageChange(currentPage + 1)"
        >
          <ChevronRight class="h-3.5 w-3.5" />
        </button>

        <button
          class="seg-arrow"
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
import { computed, nextTick, ref, watch, type CSSProperties } from "vue";
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
  let end = Math.min(props.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return pages;
});

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit("page-change", page);
  }
}

function handlePerPageChange(value: any) {
  if (value == null) {
    return;
  }

  emit("per-page-change", Number(value));
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
  const activeEl = pageRefs.value[props.currentPage];
  if (!activeEl) {
    return;
  }

  const wrap = activeEl.closest(".seg-pages");
  if (!(wrap instanceof HTMLElement)) {
    return;
  }

  const wrapRect = wrap.getBoundingClientRect();
  const itemRect = activeEl.getBoundingClientRect();
  const x = itemRect.left - wrapRect.left;
  const width = itemRect.width;

  pillStyle.value = {
    width: `${width}px`,
    transform: `translateX(${x}px)`,
    opacity: "1",
  };

  glowStyle.value = {
    width: `${width + 16}px`,
    transform: `translateX(${x - 8}px)`,
    opacity: "1",
  };
}

watch(() => [props.currentPage, visiblePages.value], updatePill, {
  immediate: true,
  deep: true,
});
</script>

<style scoped>
.pagination-shell {
  box-shadow:
    inset 0 1px 0 hsl(var(--background) / 0.9),
    0 8px 24px -14px hsl(var(--foreground) / 0.5);
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  border: 1px solid hsl(var(--border) / 0.45);
  background: hsl(var(--muted) / 0.35);
  padding: 0.24rem 0.68rem;
}

.meta-range {
  border-radius: 999px;
  background: hsl(var(--primary) / 0.12);
  color: hsl(var(--primary));
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.05rem 0.42rem;
}

.meta-sep {
  width: 1px;
  height: 0.7rem;
  background: hsl(var(--border));
  border-radius: 999px;
  opacity: 0.55;
}

.meta-total {
  color: hsl(var(--muted-foreground) / 0.82);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.rows-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
}

.rows-label {
  color: hsl(var(--muted-foreground) / 0.7);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rows-trigger {
  height: 1.85rem;
  width: 3.9rem;
  border-radius: 0.55rem;
  border: 1px solid hsl(var(--border) / 0.6);
  background: hsl(var(--background));
  box-shadow: 0 1px 3px hsl(var(--foreground) / 0.08);
  font-size: 0.72rem;
  transition: all 180ms ease;
}

.rows-trigger:hover,
.rows-trigger[data-state="open"] {
  border-color: hsl(var(--primary) / 0.45);
  background: hsl(var(--accent) / 0.6);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.rows-content {
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--popover) / 0.98);
  padding: 0.3rem;
  backdrop-filter: blur(14px) saturate(135%);
  animation: menu-pop 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.rows-item {
  border-radius: 0.45rem;
  font-size: 0.72rem;
}

.mini-rule {
  width: 1px;
  height: 1.1rem;
  border-radius: 999px;
  background: linear-gradient(
    to bottom,
    transparent,
    hsl(var(--border) / 0.7) 30%,
    hsl(var(--border) / 0.7) 70%,
    transparent
  );
}

.segmented-nav {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  border-radius: 0.78rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--muted) / 0.25);
  padding: 0.2rem;
  box-shadow:
    inset 0 1px 0 hsl(var(--background) / 0.8),
    0 6px 20px -16px hsl(var(--foreground) / 0.6);
}

.seg-glow {
  position: absolute;
  top: 50%;
  left: 0;
  height: 115%;
  border-radius: 999px;
  transform-origin: center;
  translate: 0 -50%;
  background: radial-gradient(
    ellipse at center,
    hsl(var(--primary) / 0.24) 0%,
    transparent 70%
  );
  filter: blur(6px);
  pointer-events: none;
  z-index: 0;
  transition:
    transform 320ms cubic-bezier(0.34, 1.26, 0.64, 1),
    width 260ms cubic-bezier(0.34, 1.26, 0.64, 1),
    opacity 200ms ease;
}

.seg-pill {
  position: absolute;
  top: 0.2rem;
  left: 0;
  height: calc(100% - 0.4rem);
  border-radius: 0.48rem;
  background: hsl(var(--primary));
  box-shadow:
    0 6px 15px -8px hsl(var(--primary) / 0.8),
    inset 0 1px 0 hsl(var(--primary-foreground) / 0.2);
  pointer-events: none;
  z-index: 1;
  transition:
    transform 300ms cubic-bezier(0.34, 1.35, 0.64, 1),
    width 240ms cubic-bezier(0.34, 1.35, 0.64, 1),
    opacity 180ms ease;
}

.seg-arrow,
.seg-page {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.78rem;
  min-width: 1.78rem;
  border: none;
  border-radius: 0.48rem;
  background: transparent;
  transition: all 150ms ease;
}

.seg-arrow {
  color: hsl(var(--muted-foreground) / 0.65);
}

.seg-arrow:hover:not(:disabled) {
  background: hsl(var(--background) / 0.9);
  color: hsl(var(--foreground));
}

.seg-arrow:active:not(:disabled),
.seg-page:active:not(.seg-page--active) {
  transform: scale(0.88);
}

.seg-arrow:disabled {
  opacity: 0.26;
  cursor: not-allowed;
}

.seg-rule {
  width: 1px;
  align-self: stretch;
  margin: 0.1rem 0.12rem;
  background: linear-gradient(
    to bottom,
    transparent,
    hsl(var(--border) / 0.45) 30%,
    hsl(var(--border) / 0.45) 70%,
    transparent
  );
}

.seg-pages {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.1rem;
}

.seg-page {
  padding: 0 0.34rem;
  color: hsl(var(--muted-foreground) / 0.75);
  font-size: 0.72rem;
  font-weight: 550;
}

.seg-page:hover:not(.seg-page--active) {
  color: hsl(var(--foreground));
}

.seg-page--active {
  color: hsl(var(--primary-foreground));
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  cursor: default;
}

@keyframes menu-pop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(-7px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
