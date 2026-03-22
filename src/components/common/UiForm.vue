<template>
  <div class="flex min-h-full flex-col bg-background">
    <div class="sticky top-0 z-40 border-b border-border/60 bg-background/88 backdrop-blur-xl">
      <div class="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div class="min-w-0">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              {{ mode === 'edit' ? 'Edit mode' : 'Create mode' }}
            </span>
            <Transition name="fade-fast">
              <Badge
                v-if="hasChanges && mode === 'edit'"
                variant="default"
                class="rounded-full bg-amber-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-600"
              >
                Unsaved changes
              </Badge>
            </Transition>
          </div>
          <Breadcrumb>
            <BreadcrumbList class="gap-1.5 flex-nowrap min-w-0 text-xs">
              <template v-for="(crumb, i) in breadcrumbs" :key="i">
                <BreadcrumbItem class="min-w-0">
                  <BreadcrumbPage
                    v-if="i === breadcrumbs.length - 1"
                    class="max-w-52 truncate font-semibold text-foreground"
                  >
                    {{ crumb.label }}
                  </BreadcrumbPage>
                  <BreadcrumbLink
                    v-else
                    as="button"
                    class="cursor-pointer whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
                    @click="crumb.onClick?.()"
                  >
                    {{ crumb.label }}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="i < breadcrumbs.length - 1" class="text-muted-foreground/60" />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="h-10 rounded-xl border-border/60 bg-card/80 px-3.5"
            @click="onCancel"
          >
            <ArrowLeft class="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            class="h-10 rounded-xl px-4 font-semibold shadow-[0_16px_34px_-24px_rgba(139,92,246,0.95)]"
            :disabled="submitting || (mode === 'edit' && !hasChanges)"
            @click="onSubmit"
          >
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ submitLabel ?? (mode === 'edit' ? 'Save Changes' : 'Create') }}
          </Button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center px-6 py-16">
      <div class="flex flex-col items-center gap-5 rounded-[28px] border border-border/60 bg-card px-10 py-12 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)]">
        <div class="relative h-14 w-14">
          <div class="absolute inset-0 rounded-full border-2 border-muted" />
          <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-foreground">{{ loadingText }}</p>
          <p class="mt-1 text-xs text-muted-foreground">Preparing the workspace for editing.</p>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div class="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <div class="rounded-[30px] border border-border/60 bg-card/95 px-6 py-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.55)]">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Enterprise workspace editor
            </p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {{ submitLabel ?? (mode === 'edit' ? 'Save Changes' : 'Create') }} with confidence
            </h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              A cleaner two-column composition keeps guidance visible while the main form stays focused. Shortcuts, save state, and record context are surfaced without distracting dividers.
            </p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div class="rounded-[24px] border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shortcuts</p>
              <div class="mt-3 flex items-center gap-2 text-sm text-foreground">
                <kbd class="rounded-lg border border-border/70 bg-background px-2 py-1 font-mono text-xs">⌘/Ctrl + S</kbd>
                <span>Save changes</span>
              </div>
              <div class="mt-2 flex items-center gap-2 text-sm text-foreground">
                <kbd class="rounded-lg border border-border/70 bg-background px-2 py-1 font-mono text-xs">Esc</kbd>
                <span>Return to previous screen</span>
              </div>
            </div>
            <div class="rounded-[24px] border border-border/60 bg-card/90 px-5 py-4 shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                Complete the required fields first, then review the side guidance before saving to avoid rework.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)] xl:items-start">
          <div class="space-y-5">
            <Transition name="slide-down">
              <Alert
                v-if="errorMessage"
                variant="destructive"
                class="rounded-[22px] border-destructive/30 bg-destructive/6 shadow-[0_20px_50px_-36px_rgba(239,68,68,0.6)]"
              >
                <AlertCircle class="h-4 w-4" />
                <AlertTitle class="text-[13px] font-semibold">Something went wrong</AlertTitle>
                <AlertDescription class="mt-0.5 text-[12px] leading-relaxed">
                  {{ errorMessage }}
                </AlertDescription>
              </Alert>
            </Transition>

            <Card class="overflow-hidden rounded-[30px] border-border/60 bg-card/95 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.55)]">
              <CardContent class="p-0">
                <slot name="fields" />
              </CardContent>
            </Card>
          </div>

          <div class="space-y-4 xl:sticky xl:top-24">
            <slot name="sidebar">
              <Card class="rounded-[28px] border-border/60 bg-card/95 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.45)]">
                <CardHeader class="px-5 pt-5 pb-3">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Info class="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle class="text-sm font-semibold">About this form</CardTitle>
                      <p class="mt-0.5 text-xs text-muted-foreground">Clear guidance without clutter</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-4 px-5 pb-5 pt-0 text-sm leading-6 text-muted-foreground">
                  <p>
                    Required fields are marked with <span class="font-semibold text-destructive">*</span>. Your work stays local until you click
                    <strong class="font-semibold text-foreground">{{ submitLabel ?? (mode === 'edit' ? 'Save Changes' : 'Create') }}</strong>.
                  </p>
                  <div class="rounded-2xl bg-background/80 p-4 ring-1 ring-border/60">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recommended flow</p>
                    <ol class="mt-3 space-y-2 text-sm">
                      <li>1. Capture the primary record details.</li>
                      <li>2. Use the sidebar notes for status and quality checks.</li>
                      <li>3. Save once the page shows the intended final state.</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, ArrowLeft, Info, Loader2 } from 'lucide-vue-next'
import { onMounted, onUnmounted } from 'vue'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface FormBreadcrumb {
  label: string
  onClick?: () => void
}

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    loading?: boolean
    loadingText?: string
    submitting?: boolean
    breadcrumbs?: FormBreadcrumb[]
    hasChanges?: boolean
    errorMessage?: string | null
    submitLabel?: string
  }>(),
  {
    mode: 'create',
    loading: false,
    loadingText: 'Loading…',
    submitting: false,
    breadcrumbs: () => [],
    hasChanges: false,
  },
)

const emit = defineEmits<{ submit: []; cancel: [] }>()

function onSubmit() {
  emit('submit')
}
function onCancel() {
  emit('cancel')
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    if (!props.submitting && !(props.mode === 'edit' && !props.hasChanges)) {
      onSubmit()
    }
  }
  if (e.key === 'Escape') {
    onCancel()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.slide-down-enter-active {
  transition: all 0.25s ease-out;
}
.slide-down-leave-active {
  transition: all 0.2s ease-in;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
