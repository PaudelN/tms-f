<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-sky-100 via-violet-50 to-indigo-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
    <div class="pointer-events-none absolute inset-0 opacity-50">
      <div class="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/15" />
      <div class="absolute -right-16 top-14 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/20" />
      <div class="absolute bottom-0 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/15" />
    </div>

    <div class="relative z-10 w-full max-w-2xl rounded-3xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-950/70">
      <header class="space-y-4">
        <nav v-if="breadcrumbs.length" class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground/90">
          <template v-for="(crumb, idx) in breadcrumbs" :key="`${crumb.label}-${idx}`">
            <button
              v-if="crumb.onClick"
              type="button"
              class="rounded px-1.5 py-0.5 transition-colors hover:bg-foreground/5 hover:text-foreground"
              @click="crumb.onClick"
            >
              {{ crumb.label }}
            </button>
            <span v-else class="px-1.5 py-0.5 text-foreground/80">{{ crumb.label }}</span>
            <ChevronRight v-if="idx < breadcrumbs.length - 1" class="h-3 w-3 opacity-60" />
          </template>
        </nav>

        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{{ title }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
        </div>
      </header>

      <form class="mt-7 space-y-6" @submit.prevent="$emit('submit')">
        <slot name="fields" />

        <p v-if="errorMessage" class="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {{ errorMessage }}
        </p>

        <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/85 px-5 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting || (!hasChanges && mode === 'create')"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/35 disabled:pointer-events-none disabled:opacity-60"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            {{ submitLabel }}
          </button>
        </div>
      </form>

      <aside v-if="tips.length" class="mt-6 space-y-2 rounded-2xl border border-border/60 bg-background/50 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tips</p>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li v-for="(tip, idx) in tips" :key="`${tip.text}-${idx}`" class="flex items-start gap-2">
            <span class="mt-[3px] h-1.5 w-1.5 rounded-full" :class="dotClass(tip.type)" />
            <span>{{ tip.text }}</span>
          </li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronRight, Loader2 } from 'lucide-vue-next'

export type FormBreadcrumb = { label: string; onClick?: () => void }
export type FormTip = { type: 'pro' | 'info' | 'default'; text: string }

defineEmits<{ (e: 'submit'): void; (e: 'cancel'): void }>()

withDefaults(
  defineProps<{
    mode: 'create' | 'edit'
    breadcrumbs?: FormBreadcrumb[]
    title: string
    description?: string
    tips?: FormTip[]
    submitting?: boolean
    hasChanges?: boolean
    errorMessage?: string | null
    submitLabel?: string
  }>(),
  {
    breadcrumbs: () => [],
    description: '',
    tips: () => [],
    submitting: false,
    hasChanges: false,
    errorMessage: null,
    submitLabel: 'Save Changes',
  },
)

function dotClass(type: FormTip['type']) {
  return {
    pro: 'bg-emerald-500',
    info: 'bg-sky-500',
    default: 'bg-violet-500',
  }[type]
}
</script>
