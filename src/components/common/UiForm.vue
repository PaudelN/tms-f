<template>
  <div
    class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-100 px-4 py-8 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/60 sm:px-6 sm:py-10"
  >
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div class="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10" />
    </div>

    <div class="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
      <div class="w-full max-w-2xl space-y-5">
        <nav v-if="breadcrumbs?.length" class="flex flex-wrap items-center gap-1 text-xs text-muted-foreground/80">
          <template v-for="(crumb, index) in breadcrumbs" :key="`${crumb.label}-${index}`">
            <button
              v-if="crumb.onClick"
              type="button"
              class="rounded px-1.5 py-0.5 transition-colors hover:bg-foreground/5 hover:text-foreground"
              @click="crumb.onClick"
            >
              {{ crumb.label }}
            </button>
            <span v-else class="px-1.5 py-0.5 text-foreground/85">{{ crumb.label }}</span>
            <span v-if="index < breadcrumbs.length - 1" class="text-muted-foreground/60">/</span>
          </template>
        </nav>

        <header class="space-y-2 text-center sm:text-left">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{{ modeLabel }}</p>
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{{ title }}</h1>
          <p v-if="description" class="text-sm leading-relaxed text-muted-foreground sm:text-base">{{ description }}</p>
        </header>

        <section
          class="rounded-3xl border border-white/50 bg-white/75 p-5 shadow-[0_18px_70px_-35px_rgba(30,41,59,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_18px_70px_-35px_rgba(0,0,0,0.75)] sm:p-8"
        >
          <form class="space-y-6" @submit.prevent="$emit('submit')">
            <slot name="fields" />

            <Alert v-if="errorMessage" variant="destructive" class="border-destructive/40 bg-destructive/10">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>

            <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                class="h-11 rounded-xl border-white/50 bg-white/65 px-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-slate-900/80"
                @click="$emit('cancel')"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                :disabled="submitting || !hasChanges"
                class="group h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 font-medium text-white shadow-[0_10px_30px_-15px_rgba(79,70,229,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-14px_rgba(79,70,229,1)] focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  v-if="submitting"
                  class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white/25 border-t-white"
                />
                {{ submitting ? 'Saving...' : submitLabel }}
              </Button>
            </div>
          </form>
        </section>

        <aside
          v-if="tips?.length"
          class="rounded-2xl border border-white/45 bg-white/60 p-4 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/65"
        >
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tips</h2>
          <ul class="space-y-2">
            <li
              v-for="(tip, index) in tips"
              :key="`${tip.type}-${index}`"
              class="flex items-start gap-2.5 text-sm text-muted-foreground"
            >
              <span class="mt-[5px] size-1.5 rounded-full" :class="tipToneClass(tip.type)" />
              <span>{{ tip.text }}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export type FormBreadcrumb = {
  label: string
  onClick?: () => void
}

export type FormTip = {
  type: 'pro' | 'info' | 'default'
  text: string
}

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  title: string
  description?: string
  breadcrumbs?: FormBreadcrumb[]
  tips?: FormTip[]
  hasChanges?: boolean
  submitting?: boolean
  submitLabel?: string
  errorMessage?: string | null
}>(), {
  mode: 'create',
  breadcrumbs: () => [],
  tips: () => [],
  hasChanges: true,
  submitting: false,
  submitLabel: 'Save',
  errorMessage: null,
})

defineEmits<{
  submit: []
  cancel: []
}>()

const modeLabel = computed(() => (props.mode === 'edit' ? 'Edit' : 'Create'))

function tipToneClass(type: FormTip['type']) {
  if (type === 'pro') return 'bg-emerald-500/80'
  if (type === 'info') return 'bg-blue-500/80'
  return 'bg-violet-500/80'
}
</script>
