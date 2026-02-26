<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between select-none">

    <!-- ── Left: info block ──────────────────────────────────────────────────── -->
    <div class="info-block">
      <div v-if="total > 0" class="info-inner">
        <span class="info-badge">{{ startItem }}–{{ endItem }}</span>
        <span class="info-divider" />
        <span class="info-text">{{ total }} Total</span>
      </div>
      <span v-else class="info-text">No results</span>
    </div>

    <!-- ── Right: controls ───────────────────────────────────────────────────── -->
    <div class="flex items-center gap-2">

      <!-- Rows per page -->
      <div class="rows-control">
        <span class="rows-label">Rows</span>
        <Select :model-value="String(perPage)" @update:model-value="handlePerPageChange">
          <SelectTrigger class="rows-trigger text-foreground focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent">
            <SelectValue class="font-medium text-foreground"/>
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

      <!-- Rule -->
      <div class="rule" />

      <!-- Segment nav -->
      <div class="segment">

        <!-- Glow layer -->
        <div class="segment-glow" :style="glowStyle" />

        <!-- Sliding active pill -->
        <div class="segment-pill" :style="pillStyle" />

        <!-- First -->
        <button class="seg-btn" :disabled="currentPage === 1" @click="emitPageChange(1)">
          <ChevronsLeft class="h-3.5 w-3.5" />
        </button>

        <!-- Prev -->
        <button class="seg-btn" :disabled="currentPage === 1" @click="emitPageChange(currentPage - 1)">
          <ChevronLeft class="h-3.5 w-3.5" />
        </button>

        <div class="seg-rule" />

        <!-- Page numbers -->
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

        <!-- Next -->
        <button class="seg-btn" :disabled="currentPage === totalPages" @click="emitPageChange(currentPage + 1)">
          <ChevronRight class="h-3.5 w-3.5" />
        </button>

        <!-- Last -->
        <button class="seg-btn" :disabled="currentPage === totalPages" @click="emitPageChange(totalPages)">
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
  let end   = Math.min(props.totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

function emitPageChange(page: number) {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages)
    emit("page-change", page);
}
function handlePerPageChange(v: any) {
  emit("per-page-change", Number(v));
}

// ── Animated pill + glow ─────────────────────────────────────────────────────
const pageRefs  = ref<Record<number, HTMLElement>>({});
const pillStyle = ref<CSSProperties>({ width: "0px", transform: "translateX(0px)", opacity: "0" });
const glowStyle = ref<CSSProperties>({ width: "0px", transform: "translateX(0px)", opacity: "0" });

function captureRef(el: any, page: number) {
  if (el) pageRefs.value[page] = el as HTMLElement;
}

async function updatePill() {
  await nextTick();
  const el     = pageRefs.value[props.currentPage];
  if (!el) return;
  const wrap   = el.closest(".seg-pages") as HTMLElement;
  if (!wrap) return;
  const wRect  = wrap.getBoundingClientRect();
  const eRect  = el.getBoundingClientRect();
  const x      = eRect.left - wRect.left;
  const w      = eRect.width;
  pillStyle.value = { width: `${w}px`, transform: `translateX(${x}px)`, opacity: "1" };
  glowStyle.value = {
    width:     `${w + 16}px`,
    transform: `translateX(${x - 8}px)`,
    opacity:   "1",
  };
}

watch(() => [props.currentPage, visiblePages.value], updatePill, { immediate: true, deep: true });
</script>

<style scoped>
/* ─────────────────────────────────────────────────────────────────────────── */
/* INFO BLOCK                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
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
  color: hsl(var(--muted-foreground) / 0.7);
  letter-spacing: 0.01em;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ROWS SELECT                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
.rows-control {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}
.rows-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground) / 0.5);
  white-space: nowrap;
}

.rows-trigger {
  height: 1.85rem;
  width: 3.8rem;
  padding: 0 0.45rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.05);
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  outline: none !important;
  ring: none !important;
}
.rows-trigger:hover {
  border-color: hsl(var(--primary) / 0.35);
  background: hsl(var(--accent) / 0.5);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.06), 0 1px 3px rgba(0,0,0,0.05);
}
.rows-trigger[data-state='open'] {
  border-color: hsl(var(--primary) / 0.45);
  background: hsl(var(--accent) / 0.5);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.08);
}

.rows-content {
  min-width: 4rem;
  padding: 0.3rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--popover) / 0.98);
  backdrop-filter: blur(16px) saturate(160%);
  box-shadow:
    0 0 0 1px hsl(var(--primary) / 0.04),
    0 12px 32px -6px rgba(0,0,0,0.14),
    0 4px 12px -3px rgba(0,0,0,0.08);
  animation: menuPop 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes menuPop {
  from { opacity: 0; transform: scale(0.9) translateY(-8px); }
  to   { opacity: 1; transform: scale(1)   translateY(0);    }
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
  transition: background 100ms ease, color 100ms ease;
  user-select: none;
}
.rows-item:hover, .rows-item:focus {
  background: hsl(var(--primary) / 0.09);
  color: hsl(var(--primary));
}
.rows-item[data-state='checked'] {
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

/* ─────────────────────────────────────────────────────────────────────────── */
/* RULE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────── */
/* SEGMENT CONTROL                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
.segment {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.22rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.55);
  background: hsl(var(--muted) / 0.2);
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 -1px 0 rgba(0,0,0,0.04),
    0 1px 4px rgba(0,0,0,0.06);
}

/* ── Diffuse glow behind active page number ─────────────────────────────── */
.segment-glow {
  position: absolute;
  top: 50%;
  left: 0;
  transform-origin: center center;
  translate: 0 -50%;
  height: 110%;
  border-radius: 9999px;
  background: radial-gradient(ellipse at center, hsl(var(--primary) / 0.25) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(6px);
  transition:
    transform 300ms cubic-bezier(0.34, 1.3, 0.64, 1),
    width     250ms cubic-bezier(0.34, 1.3, 0.64, 1),
    opacity   200ms ease;
  z-index: 0;
}

/* ── Solid sliding pill ─────────────────────────────────────────────────── */
.segment-pill {
  position: absolute;
  top: 0.22rem;
  left: 0;
  height: calc(100% - 0.44rem);
  border-radius: 0.45rem;
  background: hsl(var(--primary));
  box-shadow:
    0 2px 10px hsl(var(--primary) / 0.45),
    0 1px 3px rgba(0,0,0,0.15),
    inset 0 1px 0 rgba(255,255,255,0.15);
  pointer-events: none;
  transition:
    transform 280ms cubic-bezier(0.34, 1.4, 0.64, 1),
    width     230ms cubic-bezier(0.34, 1.4, 0.64, 1),
    opacity   180ms ease;
  z-index: 1;
}

/* ── Arrow buttons ────────────────────────────────────────────────────────── */
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
  color: hsl(var(--muted-foreground) / 0.55);
  cursor: pointer;
  transition:
    background 160ms ease,
    color      160ms ease,
    transform  100ms ease,
    box-shadow 160ms ease;
  outline: none;
  flex-shrink: 0;
}
.seg-btn:hover:not(:disabled) {
  background: hsl(var(--background) / 0.9);
  color: hsl(var(--foreground));
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.seg-btn:active:not(:disabled) {
  transform: scale(0.84);
  background: hsl(var(--primary) / 0.12);
  color: hsl(var(--primary));
}
.seg-btn:disabled {
  opacity: 0.22;
  cursor: not-allowed;
}

/* ── Inner rule between arrows and pages ─────────────────────────────────── */
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

/* ── Pages row ────────────────────────────────────────────────────────────── */
.seg-pages {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.1rem;
  z-index: 2;
}

/* ── Individual page number ───────────────────────────────────────────────── */
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
  color: hsl(var(--muted-foreground) / 0.65);
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 160ms ease, transform 100ms ease;
  outline: none;
}
.seg-page:hover:not(.seg-page--on) {
  color: hsl(var(--foreground));
}
.seg-page:active:not(.seg-page--on) {
  transform: scale(0.86);
}

/* Active: white text sits above the pill */
.seg-page--on {
  color: hsl(var(--primary-foreground));
  font-weight: 700;
  cursor: default;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
</style>