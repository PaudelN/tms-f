<template>
  <div
    class="flex select-none flex-col gap-3 rounded-xl border border-border/50 bg-background/40 px-2 py-2 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <!-- Left: table stats -->
    <div class="info-block">
      <div v-if="total > 0" class="info-inner">
        <span class="info-badge">{{ startItem }}–{{ endItem }}</span>
        <span class="info-divider" />
        <span class="info-text">{{ total }} Total</span>
      </div>
      <span v-else class="info-text">No results</span>
    </div>

    <!-- Right: controls -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="rows-control">
        <span class="rows-label">Rows</span>
        <Select
          :model-value="String(perPage)"
          @update:model-value="handlePerPageChange"
        >
          <SelectTrigger
            class="rows-trigger text-foreground focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <SelectValue class="font-medium text-foreground" />
          </SelectTrigger>
          <SelectContent class="rows-content">
            <SelectItem
              v-for="size in pageSizes"
              :key="size"
              :value="String(size)"
              class="rows-item"
            >
              <SelectItemText>{{ size }}</SelectItemText>
              <SelectItemIndicator class="absolute right-2">
                <span class="rows-dot" />
              </SelectItemIndicator>
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
          @click="emitPageChange(1)"
        >
          <ChevronsLeft class="h-3.5 w-3.5" />
        </button>

        <button
          class="seg-btn"
          :disabled="currentPage === 1"
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
          @click="emitPageChange(currentPage + 1)"
        >
          <ChevronRight class="h-3.5 w-3.5" />
        </button>

        <button
          class="seg-btn"
          :disabled="currentPage === totalPages"
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
import SelectItemText from "@/components/ui/select/SelectItemText.vue";
import { SelectItemIndicator } from "reka-ui";
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
  let end = Math.min(props.totalPages, start + maxVisible - 1);

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

function handlePerPageChange(value: unknown) {
  if (value !== null && value !== undefined) {
    emit("per-page-change", Number(value));
  }
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
    return;
  }

  const maybeElement = (el as { $el?: unknown } | null)?.$el;
  if (maybeElement instanceof HTMLElement) {
    pageRefs.value[page] = maybeElement;
  }
}

async function updatePill() {
  await nextTick();

  const el = pageRefs.value[props.currentPage];
  if (!el) return;

  const wrap = el.closest(".seg-pages");
  if (!(wrap instanceof HTMLElement)) return;

  const wrapRect = wrap.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const x = elRect.left - wrapRect.left;
  const width = elRect.width;

  pillStyle.value = {
    width: `${width}px`,
    transform: `translateX(${x}px)`,
    opacity: "1",
  };

  glowStyle.value = {
    width: `${width + 18}px`,
    transform: `translateX(${x - 9}px)`,
    opacity: "1",
  };
}

watch(
  () => [props.currentPage, visiblePages.value],
  () => {
    void updatePill();
  },
  { immediate: true, deep: true },
);
</script>

<style scoped>
.info-block {
  display: inline-flex;
  align-items: center;
}

.info-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.22rem 0.7rem;
  border-radius: 9999px;
  border: 1px solid hsl(var(--border) / 0.5);
  background: hsl(var(--muted) / 0.35);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.info-badge {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  padding: 0.05rem 0.45rem;
  border-radius: 9999px;
}

.info-divider {
  width: 1px;
  height: 0.7rem;
  background: hsl(var(--border));
  border-radius: 9999px;
  opacity: 0.5;
}

.info-text {
  font-size: 0.68rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground) / 0.75);
  letter-spacing: 0.01em;
}

.rows-control {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.rows-label {
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground) / 0.55);
  white-space: nowrap;
}

.rows-trigger {
  height: 1.85rem;
  width: 3.9rem;
  padding: 0 0.45rem;
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 0.55rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--background));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: border-color 220ms ease, box-shadow 220ms ease, background 220ms ease;
}

.rows-trigger:hover {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--accent) / 0.55);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.07), 0 1px 3px rgba(0, 0, 0, 0.05);
}

.rows-trigger[data-state="open"] {
  border-color: hsl(var(--primary) / 0.5);
  background: hsl(var(--accent) / 0.55);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
}

.rows-content {
  min-width: 4.1rem;
  padding: 0.3rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--popover) / 0.98);
  backdrop-filter: blur(16px) saturate(160%);
  box-shadow:
    0 0 0 1px hsl(var(--primary) / 0.04),
    0 12px 32px -6px rgba(0, 0, 0, 0.14),
    0 4px 12px -3px rgba(0, 0, 0, 0.08);
  animation: menuPop 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes menuPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.rows-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.28rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  cursor: pointer;
  outline: none;
  transition: background 120ms ease, color 120ms ease;
}

.rows-item:hover,
.rows-item:focus {
  background: hsl(var(--primary) / 0.09);
  color: hsl(var(--primary));
}

.rows-item[data-state="checked"] {
  background: hsl(var(--primary) / 0.12);
  color: hsl(var(--primary));
  font-weight: 700;
}

.rows-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: hsl(var(--primary));
  box-shadow: 0 0 4px hsl(var(--primary) / 0.6);
}

.rule {
  width: 1px;
  height: 1.1rem;
  background: linear-gradient(
    to bottom,
    transparent,
    hsl(var(--border) / 0.7) 30%,
    hsl(var(--border) / 0.7) 70%,
    transparent
  );
  border-radius: 9999px;
  flex-shrink: 0;
  margin: 0 0.125rem;
}

.segment {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.22rem;
  border-radius: 0.78rem;
  border: 1px solid hsl(var(--border) / 0.58);
  background: linear-gradient(
    180deg,
    hsl(var(--background) / 0.9) 0%,
    hsl(var(--muted) / 0.24) 100%
  );
  backdrop-filter: blur(8px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(0, 0, 0, 0.06);
}

.segment-glow {
  position: absolute;
  top: 50%;
  left: 0;
  transform-origin: center center;
  translate: 0 -50%;
  height: 112%;
  border-radius: 9999px;
  background: radial-gradient(
    ellipse at center,
    hsl(var(--primary) / 0.27) 0%,
    transparent 72%
  );
  pointer-events: none;
  filter: blur(7px);
  transition:
    transform 330ms cubic-bezier(0.34, 1.3, 0.64, 1),
    width 260ms cubic-bezier(0.34, 1.3, 0.64, 1),
    opacity 200ms ease;
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
    0 2px 12px hsl(var(--primary) / 0.48),
    0 1px 3px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  pointer-events: none;
  transition:
    transform 300ms cubic-bezier(0.34, 1.4, 0.64, 1),
    width 240ms cubic-bezier(0.34, 1.4, 0.64, 1),
    opacity 180ms ease;
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
  color: hsl(var(--muted-foreground) / 0.6);
  cursor: pointer;
  transition:
    background 170ms ease,
    color 170ms ease,
    transform 120ms ease,
    box-shadow 170ms ease;
  outline: none;
  flex-shrink: 0;
}

.seg-btn:hover:not(:disabled) {
  background: hsl(var(--background) / 0.92);
  color: hsl(var(--foreground));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.seg-btn:active:not(:disabled) {
  transform: scale(0.86);
  background: hsl(var(--primary) / 0.12);
  color: hsl(var(--primary));
}

.seg-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.seg-rule {
  width: 1px;
  align-self: stretch;
  margin: 0.1rem 0.15rem;
  background: linear-gradient(
    to bottom,
    transparent,
    hsl(var(--border) / 0.5) 30%,
    hsl(var(--border) / 0.5) 70%,
    transparent
  );
  flex-shrink: 0;
}

.seg-pages {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.1rem;
  z-index: 2;
}

.seg-page {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  min-width: 1.75rem;
  padding: 0 0.33rem;
  border-radius: 0.45rem;
  border: none;
  background: transparent;
  color: hsl(var(--muted-foreground) / 0.68);
  font-size: 0.71rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 170ms ease, transform 120ms ease;
  outline: none;
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
</style>
