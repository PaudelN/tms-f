<template>
  <FormItem class="group relative">
    <!-- Floating-style label block -->
    <div class="relative">
      <!-- Label pill -->
      <div class="flex items-center justify-between mb-2">
        <FormLabel
          :class="[
            'flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 select-none',
            hasError
              ? 'text-destructive'
              : isFocused
                ? 'text-primary'
                : 'text-muted-foreground',
          ]"
        >
          <!-- Color accent bar on focus -->
          <span
            :class="[
              'inline-block w-0.5 h-3 rounded-full transition-all duration-300',
              hasError
                ? 'bg-destructive'
                : isFocused
                  ? 'bg-primary'
                  : 'bg-border',
            ]"
          />
          <component :is="icon" v-if="icon" class="h-3 w-3 shrink-0" />
          {{ label }}
          <span
            v-if="required"
            class="text-destructive font-bold normal-case tracking-normal"
            >*</span
          >
        </FormLabel>

        <!-- Right side: badge + success + counter slot -->
        <div class="flex items-center gap-2">
          <Transition name="scale-pop">
            <span
              v-if="showSuccess"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider"
            >
              <CheckCircle2 class="h-3 w-3" />
              Validated
            </span>
          </Transition>

          <span
            v-if="badge"
            :class="[
              'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm border',
              badge === 'Optional'
                ? 'text-muted-foreground border-border bg-muted'
                : badge === 'Required'
                  ? 'text-primary border-primary bg-primary-20'
                  : 'text-muted-foreground border-border bg-muted',
            ]"
          >
            {{ badge }}
          </span>

          <slot name="label-right" />
        </div>
      </div>

      <!-- Input slot with left-border focus indicator -->
      <div
        :class="[
          'relative rounded-xs transition-all duration-200 overflow-hidden',
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:rounded-r-xs before:transition-all before:duration-300',
          hasError
            ? 'before:bg-destructive ring-1 ring-destructive'
            : isFocused
              ? 'before:bg-primary'
              : 'before:bg-transparent',
        ]"
        @focusin="isFocused = true"
        @focusout="isFocused = false"
      >
        <FormControl>
          <slot />
        </FormControl>
      </div>
    </div>

    <!-- Footer: error / hint / slot -->
    <div class="flex items-start justify-between gap-3 mt-2 min-h-4 pl-3">
      <div class="flex-1 min-w-0">
        <Transition name="slide-in-error">
          <div v-if="hasError" class="flex items-center gap-1.5">
            <AlertCircle class="h-3 w-3 text-destructive shrink-0" />
            <FormMessage class="text-[11px] font-medium leading-snug" />
          </div>
          <FormDescription
            v-else-if="hint"
            class="text-[11px] text-muted-foreground leading-snug mt-0"
          >
            {{ hint }}
          </FormDescription>
        </Transition>
      </div>
      <slot name="hint-right" />
    </div>
  </FormItem>
</template>

<script setup lang="ts">
  import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage,
    useFormField,
  } from "@/components/ui/form";
  import { AlertCircle, CheckCircle2 } from "lucide-vue-next";
  import { computed, ref, type Component } from "vue";

  defineProps<{
    label: string;
    required?: boolean;
    hint?: string;
    badge?: string;
    showSuccess?: boolean;
    icon?: Component;
  }>();

  const { error } = useFormField();
  const hasError = computed(() => !!error.value);
  const isFocused = ref(false);
</script>

<style scoped>
  .scale-pop-enter-active {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .scale-pop-enter-from {
    opacity: 0;
    transform: scale(0.6) translateX(4px);
  }
  .scale-pop-leave-active {
    transition: all 0.15s ease;
  }
  .scale-pop-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }

  .icon-swap-enter-active {
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .icon-swap-enter-from {
    opacity: 0;
    transform: translateY(-50%) scale(0.5) rotate(-15deg);
  }

  .slide-in-error-enter-active {
    transition: all 0.2s ease-out;
  }
  .slide-in-error-enter-from {
    opacity: 0;
    transform: translateX(-4px);
  }
  .slide-in-error-leave-active {
    transition: all 0.15s ease-in;
  }
  .slide-in-error-leave-to {
    opacity: 0;
  }
</style>
