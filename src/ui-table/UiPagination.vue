<template>
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between select-none"
  >
    <!-- ── Left: Progress arc + info ──────────────────────────── -->
    <div class="flex items-center gap-3">
      <!-- Circular progress indicator -->
      <div class="relative shrink-0 w-12 h-12">
        <svg class="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          <!-- Track -->
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke="rgb(var(--color-muted-foreground))"
            stroke-width="2.5"
            opacity="0.2"
          />

          <!-- Progress main line -->
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke="rgb(var(--color-primary))"
            stroke-width="2.5"
            stroke-linecap="round"
            :stroke-dasharray="`${progressArc} 94.25`"
            class="transition-all duration-500 ease-out"
            style="filter: drop-shadow(0 0 2.5px rgb(var(--color-primary) / 1))"
          />
          <!-- Glowing tip dot -->
          <circle
            v-if="progressPercent > 2"
            cx="20"
            cy="5"
            r="2.2"
            fill="rgb(var(--color-primary))"
            :transform="`rotate(${progressPercent * 3.6} 20 20)`"
            class="transition-all duration-500 ease-out"
            style="filter: drop-shadow(0 0 4px rgb(var(--color-primary)))"
          />
        </svg>
        <!-- Center % label -->
        <div class="absolute inset-0 flex items-center justify-center">
          <span
            class="text-[9px] font-black text-primary leading-none tracking-tight flex items-baseline gap-x-px"
          >
            {{ Math.round(progressPercent)
            }}<span class="text-[9px] font-extrabold opacity-75">%</span>
          </span>
        </div>
      </div>

      <!-- Info text -->
      <div v-if="total > 0" class="flex flex-col gap-0.5">
        <div class="flex items-center gap-1.5">
          <span
            class="text-[10px] font-bold tracking-[0.15em] uppercase text-primary"
          >
            {{ startItem }}–{{ endItem }}
          </span>
          <span
            class="text-[10px] font-bold tracking-[0.15em] uppercase text-primary"
          >
            of {{ total }} records
          </span>
        </div>
      </div>
      <span
        v-else
        class="text-[10px] tracking-widest uppercase text-muted-foreground/40"
      >
        — empty —
      </span>
    </div>

    <!-- ── Right: Control cluster ──────────────────────────────── -->
    <div class="flex items-center gap-2">
      <!-- Rows selector -->
      <div
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/40 bg-muted/10 backdrop-blur-sm"
      >
        <span
          class="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 font-bold"
          >PG/</span
        >
        <Select
          :model-value="String(perPage)"
          @update:model-value="handlePerPageChange"
        >
          <SelectTrigger
            class="h-auto w-auto p-0 border-none bg-transparent shadow-none text-[12px] font-bold text-primary tracking-wider cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border [&>svg]:ml-1 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-primary outline-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            class="min-w-18 rounded-sm border border-border bg-card mt-[3.4px] shadow-lg"
          >
            <SelectItem
              v-for="size in pageSizes"
              :key="size"
              :value="String(size)"
              class="relative flex items-center px-2.5 py-1.5 rounded-md text-[11px] font-bold tracking-wider text-foreground cursor-pointer outline-none transition-all duration-100 hover:bg-primary/15 hover:text-primary data-[state=checked]:bg-primary/20 data-[state=checked]:text-primary"
            >
              <SelectItemText>{{ size }}</SelectItemText>
              <SelectItemIndicator class="ml-3" />
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Separator -->
      <span class="text-border/40 text-xs font-light select-none">/</span>

      <!-- Main nav bar -->
      <div
        class="relative flex items-center rounded-xl border border-border/40 bg-muted/10 backdrop-blur-sm overflow-hidden"
        style="
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 0 rgba(0, 0, 0, 0.08);
        "
      >
        <!-- Animated glow track -->
        <div
          class="absolute inset-y-0 pointer-events-none z-0 transition-all duration-300 ease-out"
          :style="glowTrackStyle"
        />

        <!-- Sliding pill -->
        <div
          class="absolute top-[3px] h-[calc(100%-6px)] rounded-lg pointer-events-none z-[1] transition-all duration-300 ease-[cubic-bezier(0.34,1.5,0.64,1)]"
          :style="pillStyle"
          style="
            background: linear-gradient(
              135deg,
              rgb(var(--color-primary)) 0%,
              rgb(var(--color-primary) / 0.8) 100%
            );
            box-shadow:
              0 2px 12px rgb(var(--color-primary) / 0.5),
              0 0 1px rgb(var(--color-primary) / 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          "
        />

        <!-- ◀◀ First — only rendered when not on page 1 -->
        <button
          v-if="currentPage > 1"
          class="relative z-[2] flex items-center justify-center h-8 w-7 text-muted-foreground/40 cursor-pointer transition-all duration-150 hover:text-foreground active:scale-90"
          @click="emitPageChange(1)"
          title="First page"
        >
          <ChevronsLeft class="h-3 w-3" />
        </button>

        <!-- ◀ Prev — only rendered when not on page 1 -->
        <button
          v-if="currentPage > 1"
          class="relative z-[2] flex items-center justify-center h-8 w-7 text-muted-foreground/40 cursor-pointer transition-all duration-150 hover:text-foreground active:scale-90"
          @click="emitPageChange(currentPage - 1)"
          title="Previous page"
        >
          <ChevronLeft class="h-3 w-3" />
        </button>

        <!-- Left divider — only when prev buttons are present -->
        <div
          v-if="currentPage > 1"
          class="w-px h-3.5 bg-border/25 flex-shrink-0"
        />

        <!-- Page number buttons -->
        <div class="relative flex items-center z-[2]">
          <button
            v-for="page in visiblePages"
            :key="page"
            :ref="(el) => captureRef(el, page)"
            class="relative flex items-center justify-center h-8 min-w-[30px] px-1 text-[11px] font-bold tracking-wider transition-all duration-150"
            :class="
              page === currentPage
                ? 'text-primary-foreground cursor-default'
                : 'text-muted-foreground/50 hover:text-foreground active:scale-90 cursor-pointer'
            "
            @click="emitPageChange(page)"
          >
            {{ page }}
          </button>
        </div>

        <!-- Right divider — only when next buttons are present -->
        <div
          v-if="currentPage < totalPages"
          class="w-px h-3.5 bg-border/25 flex-shrink-0"
        />

        <!-- ▶ Next — only rendered when not on last page -->
        <button
          v-if="currentPage < totalPages"
          class="relative z-[2] flex items-center justify-center h-8 w-7 text-muted-foreground/40 cursor-pointer transition-all duration-150 hover:text-foreground active:scale-90"
          @click="emitPageChange(currentPage + 1)"
          title="Next page"
        >
          <ChevronRight class="h-3 w-3" />
        </button>

        <!-- ▶▶ Last — only rendered when not on last page -->
        <button
          v-if="currentPage < totalPages"
          class="relative z-[2] flex items-center justify-center h-8 w-7 text-muted-foreground/40 cursor-pointer transition-all duration-150 hover:text-foreground active:scale-90"
          @click="emitPageChange(totalPages)"
          title="Last page"
        >
          <ChevronsRight class="h-3 w-3" />
        </button>
      </div>

      <div
        v-if="totalPages >= 2"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/40 bg-muted/10 backdrop-blur-sm"
      >
        <span
          class="text-[9px] tracking-wide uppercase text-muted-foreground/40 font-bold"
          >GO-TO:</span
        >
        <input
          type="number"
          min="1"
          :max="totalPages"
          :placeholder="String(currentPage)"
          class="w-4 bg-transparent border-none text-[11px] font-bold text-primary tracking-wider outline-none focus:outline-none placeholder:text-muted-foreground/30 cursor-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          @keydown.enter="handleJump"
          @blur="handleJump"
          ref="jumpInput"
        />
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
  import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  } from "lucide-vue-next";
  import { SelectItemIndicator } from "reka-ui";
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

  const jumpInput = ref<HTMLInputElement | null>(null);

  const startItem = computed(() =>
    props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1,
  );
  const endItem = computed(() =>
    Math.min(props.currentPage * props.perPage, props.total),
  );
  const progressPercent = computed(() =>
    props.totalPages === 0 ? 0 : (props.currentPage / props.totalPages) * 100,
  );
  // circumference of r=15 circle = 2π × 15 ≈ 94.25
  const progressArc = computed(() => (progressPercent.value / 100) * 94.25);

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(props.totalPages, start + maxVisible - 1);
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
  function handleJump(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    if (val >= 1 && val <= props.totalPages) emitPageChange(val);
    if (jumpInput.value) jumpInput.value.value = "";
  }

  // ── Animated pill ────────────────────────────────────────────────────────────
  const pageRefs = ref<Record<number, HTMLElement>>({});
  const pillStyle = ref<CSSProperties>({
    width: "0px",
    transform: "translateX(0px)",
    opacity: "0",
  });
  const glowTrackStyle = ref<CSSProperties>({
    width: "0px",
    transform: "translateX(0px)",
    opacity: "0",
  });

  function captureRef(el: any, page: number) {
    if (el) pageRefs.value[page] = el as HTMLElement;
  }

  async function updatePill() {
    await nextTick();
    const el = pageRefs.value[props.currentPage];
    if (!el) return;
    const wrap = el.parentElement as HTMLElement;
    const container = wrap?.parentElement as HTMLElement;
    if (!wrap || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const x = eRect.left - cRect.left;
    const w = eRect.width;
    pillStyle.value = {
      width: `${w}px`,
      transform: `translateX(${x}px)`,
      opacity: "1",
    };
    glowTrackStyle.value = {
      width: `${w + 24}px`,
      transform: `translateX(${x - 12}px)`,
      opacity: "1",
      background:
        "radial-gradient(ellipse at center, rgb(var(--color-primary)/0.2) 0%, transparent 70%)",
      filter: "blur(8px)",
    };
  }

  watch(() => [props.currentPage, visiblePages.value], updatePill, {
    immediate: true,
    deep: true,
  });
</script>
