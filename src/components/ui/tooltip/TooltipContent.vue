<script setup lang="ts">
import { TooltipContent, useForwardProps } from "reka-ui";
import type { TooltipContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

interface Props extends TooltipContentProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  sideOffset: 6,
});

const forwarded = useForwardProps(props);
</script>

<template>
  <TooltipContent
    v-bind="forwarded"
    :class="cn(
      // ── Layout ──────────────────────────────────────────────────────────
      'z-50 w-fit max-w-50 px-1 py-0.5',
      'text-xs font-medium tracking-tight leading-snug',

      // ── Cloud shape ──────────────────────────────────────────────────────
      'rounded-sm',

      // ── Frosted glass ────────────────────────────────────────────────────
      'bg-primary dark:bg-primary',
      'backdrop-blur-md backdrop-saturate-150',

      // ── Border + inner ring ───────────────────────────────────────────────
      'border border-white/20 dark:border-white/10',
      'ring-1 ring-inset ring-white/10',

      // ── Text ─────────────────────────────────────────────────────────────
      'text-foreground/90 dark:text-white/85',

      // ── Floating shadow ───────────────────────────────────────────────────
      'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.18),0_1.5px_6px_-1px_rgba(0,0,0,0.10)]',
      'dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.55),0_1.5px_6px_-1px_rgba(0,0,0,0.35)]',

      // ── Enter ─────────────────────────────────────────────────────────────
      'animate-in fade-in-0 zoom-in-95',

      // ── Exit ──────────────────────────────────────────────────────────────
      'data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0',
      'data-[state=closed]:zoom-out-95',

      // ── Directional slide ─────────────────────────────────────────────────
      'data-[side=bottom]:slide-in-from-top-1.5',
      'data-[side=left]:slide-in-from-right-1.5',
      'data-[side=right]:slide-in-from-left-1.5',
      'data-[side=top]:slide-in-from-bottom-1.5',

      // ── Transition ────────────────────────────────────────────────────────
      'transition-all duration-200 ease-out',

      props.class,
    )"
  >
    <slot />
  </TooltipContent>
</template>