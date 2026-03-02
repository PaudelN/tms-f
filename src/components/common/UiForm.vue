<template>
  <div class="flex-1 flex flex-col min-h-0 w-full bg-background">

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p class="text-[11px] text-muted-foreground font-medium tracking-widest uppercase">{{ loadingText }}</p>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col min-h-0">

      <!-- ── Top bar ── -->
      <div class="px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0 border-b border-border/30">
        <nav class="flex items-center gap-2">
          <button
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
            class="flex items-center gap-2"
            @click="crumb.onClick?.()"
          >
            <span
              :class="[
                'transition-colors',
                i === breadcrumbs.length - 1
                  ? 'text-[13px] font-semibold text-foreground cursor-default'
                  : 'text-[12px] font-medium text-muted-foreground hover:text-foreground cursor-pointer',
              ]"
            >{{ crumb.label }}</span>
            <ChevronRight v-if="i < breadcrumbs.length - 1" class="h-3 w-3 text-muted-foreground/40" />
          </button>
        </nav>

        <button
          type="button"
          class="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          @click="onCancel"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          Back
        </button>
      </div>

      <!-- ── Scrollable body ── -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="w-full h-full flex flex-col">

          <!-- Page title strip -->
          <div class="px-8 pt-7 pb-6 border-b border-border/20 flex-shrink-0">
            <h1 class="text-[26px] font-semibold tracking-tight text-foreground leading-tight">{{ title }}</h1>
            <p v-if="description" class="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{{ description }}</p>
          </div>

          <!-- Main form area -->
          <div class="flex-1 px-8 py-8 space-y-8">

            <!-- Global error -->
            <div
              v-if="errorMessage"
              class="flex items-start gap-3 rounded-lg bg-destructive/5 border border-destructive/20 px-5 py-4"
            >
              <AlertCircle class="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p class="text-[13px] text-destructive leading-relaxed">{{ errorMessage }}</p>
            </div>

            <!-- Fields -->
            <div class="space-y-7">
              <slot name="fields" />
            </div>

            <!-- Tips -->
            <div v-if="tips.length" class="space-y-3 pt-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Tips</p>
              <div class="space-y-2">
                <div
                  v-for="(tip, i) in tips"
                  :key="i"
                  class="flex items-start gap-3 px-4 py-3 rounded-lg border text-[12px] leading-relaxed"
                  :class="getTipClass(tip.type)"
                >
                  <span
                    class="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest opacity-60 mt-0.5 w-12"
                    :class="getTipLabelClass(tip.type)"
                  >{{ getTipLabel(tip.type) }}</span>
                  <span :class="getTipTextClass(tip.type)">{{ tip.text }}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- ── Sticky footer ── -->
          <div class="flex-shrink-0 sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur-sm px-8 py-4">
            <div class="flex items-center justify-between">
              <div class="text-[11px] text-muted-foreground/50">
                <span v-if="hasChanges && mode === 'edit'" class="flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                  Unsaved changes
                </span>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="h-9 px-6 text-[13px] font-medium rounded-md border border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/30 transition-all"
                  @click="onCancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="h-9 px-7 text-[13px] font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  :disabled="submitting || (mode === 'edit' && !hasChanges)"
                  @click="onSubmit"
                >
                  <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
                  {{ submitLabel ?? (mode === 'edit' ? 'Save Changes' : 'Create') }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { AlertCircle, ArrowLeft, ChevronRight, Loader2 } from 'lucide-vue-next'

export interface FormBreadcrumb {
  label: string
  onClick?: () => void
}

export interface FormMetaField {
  label: string
  value?: string
  icon?: Component
  type?: 'text' | 'badge'
  badgeClass?: string
}

export type TipType = 'default' | 'pro' | 'info' | 'warning'

export interface FormTip {
  text: string
  type?: TipType
}

withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  loading?: boolean
  loadingText?: string
  submitting?: boolean
  breadcrumbs?: FormBreadcrumb[]
  title?: string
  description?: string
  tips?: FormTip[]
  hasChanges?: boolean
  errorMessage?: string | null
  submitLabel?: string
}>(), {
  mode: 'create',
  loading: false,
  loadingText: 'Loading…',
  submitting: false,
  breadcrumbs: () => [],
  title: 'Form',
  tips: () => [],
  hasChanges: false,
})

const emit = defineEmits<{ submit: []; cancel: [] }>()
function onSubmit() { emit('submit') }
function onCancel() { emit('cancel') }

function getTipLabel(type?: TipType): string {
  switch (type) {
    case 'pro':     return 'Pro'
    case 'info':    return 'Note'
    case 'warning': return 'Heads up'
    default:        return 'Tip'
  }
}

function getTipClass(type?: TipType): string {
  switch (type) {
    case 'pro':     return 'bg-primary/5 border-primary/15'
    case 'info':    return 'bg-blue-50/60 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/30'
    case 'warning': return 'bg-amber-50/60 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30'
    default:        return 'bg-muted/20 border-border/30'
  }
}

function getTipLabelClass(type?: TipType): string {
  switch (type) {
    case 'pro':     return 'text-primary'
    case 'info':    return 'text-blue-500'
    case 'warning': return 'text-amber-500'
    default:        return 'text-muted-foreground'
  }
}

function getTipTextClass(type?: TipType): string {
  switch (type) {
    case 'pro':     return 'text-primary/70'
    case 'info':    return 'text-blue-700 dark:text-blue-300'
    case 'warning': return 'text-amber-700 dark:text-amber-300'
    default:        return 'text-muted-foreground'
  }
}
</script>