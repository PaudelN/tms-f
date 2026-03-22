<template>
  <div class="flex min-h-full flex-col bg-background">
    <div class="sticky top-0 z-40 border-b border-border/60 bg-background/86 backdrop-blur-xl">
      <div
        class="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6"
      >
        <div class="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="header"
            shape="circle"
            size="icon"
            class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card text-primary shadow-[0_10px_30px_rgb(15_23_42/0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground"
            @click="onCancel"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>

          <div class="min-w-0 space-y-1">
            <Breadcrumb>
              <BreadcrumbList class="min-w-0 flex-nowrap gap-1 text-[12px]">
                <template v-for="(crumb, i) in breadcrumbs" :key="i">
                  <BreadcrumbItem class="min-w-0">
                    <BreadcrumbPage
                      v-if="i === breadcrumbs.length - 1"
                      class="max-w-48 truncate font-semibold text-foreground"
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
                  <BreadcrumbSeparator
                    v-if="i < breadcrumbs.length - 1"
                    class="text-muted-foreground/50"
                  />
                </template>
              </BreadcrumbList>
            </Breadcrumb>

            <div class="flex flex-wrap items-center gap-2">
              <p class="text-xs text-muted-foreground">
                {{ mode === "edit" ? "Review changes and publish when ready." : "Complete the required fields to create a polished record." }}
              </p>
              <Transition name="fade-fast">
                <Badge
                  v-if="hasChanges && mode === 'edit'"
                  variant="default"
                  class="rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary"
                >
                  Draft changes
                </Badge>
              </Transition>
            </div>
          </div>
        </div>

        <div class="hidden items-center gap-2 rounded-2xl border border-border/60 bg-card/80 p-2 shadow-[0_8px_30px_rgb(15_23_42/0.06)] md:flex">
          <div class="rounded-xl bg-muted/80 px-3 py-2 text-right">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Shortcut</p>
            <p class="text-xs font-medium text-foreground">⌘ / Ctrl + S</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            class="h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:bg-muted"
            @click="onCancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            class="h-11 rounded-xl px-5 text-sm font-semibold shadow-[0_12px_24px_rgb(var(--color-primary)/0.22)]"
            :disabled="submitting || (mode === 'edit' && !hasChanges)"
            @click="onSubmit"
          >
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ submitLabel ?? (mode === "edit" ? "Save Changes" : "Create") }}
          </Button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center px-6 py-16">
      <div class="crud-shell flex w-full max-w-md flex-col items-center gap-5 rounded-[32px] border border-border/60 bg-card/90 px-8 py-12 text-center shadow-[0_28px_60px_rgb(15_23_42/0.10)]">
        <div class="relative h-14 w-14">
          <div class="absolute inset-0 rounded-full border border-primary/20" />
          <div
            class="absolute inset-1 rounded-full border-2 border-transparent border-t-primary animate-spin"
          />
          <div class="absolute inset-4 rounded-full bg-primary/10" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">{{ loadingText }}</p>
          <p class="text-xs text-muted-foreground">Preparing the workspace and form sections…</p>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div class="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 xl:flex-row xl:items-start">
        <div class="min-w-0 flex-1 space-y-5">
          <Transition name="slide-down">
            <Alert
              v-if="errorMessage"
              variant="destructive"
              class="rounded-[24px] border-destructive/30 bg-destructive/5 shadow-[0_14px_30px_rgb(239_68_68/0.12)]"
            >
              <AlertCircle class="h-4 w-4" />
              <AlertTitle class="text-[13px] font-semibold">Something went wrong</AlertTitle>
              <AlertDescription class="mt-0.5 text-[12px] leading-relaxed">
                {{ errorMessage }}
              </AlertDescription>
            </Alert>
          </Transition>

          <div class="crud-shell rounded-[32px] border border-border/60 bg-card/92 shadow-[0_24px_60px_rgb(15_23_42/0.08)] backdrop-blur">
            <div class="border-b border-border/50 px-6 py-5 sm:px-8">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div class="space-y-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                    {{ mode === "edit" ? "Edit record" : "Create record" }}
                  </p>
                  <h2 class="text-2xl font-semibold tracking-tight text-foreground">
                    {{ submitLabel ?? (mode === "edit" ? "Save Changes" : "Create") }}
                  </h2>
                  <p class="max-w-2xl text-sm text-muted-foreground">
                    Use this workspace to capture the most important information first, then enrich it with context and scheduling details.
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Progress</p>
                    <p class="mt-1 text-sm font-medium text-foreground">
                      {{ hasChanges ? "Edits ready for review" : mode === "edit" ? "No changes yet" : "Start with key details" }}
                    </p>
                  </div>
                  <div class="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Navigation</p>
                    <p class="mt-1 text-sm font-medium text-foreground">Sticky actions stay visible while you move through the form.</p>
                  </div>
                </div>
              </div>
            </div>

            <Card class="border-0 bg-transparent shadow-none">
              <CardContent class="p-0">
                <slot name="fields" />
              </CardContent>
            </Card>
          </div>
        </div>

        <aside class="w-full shrink-0 xl:sticky xl:top-24 xl:max-w-[400px]">
          <div class="space-y-4">
            <div class="crud-shell rounded-[28px] border border-border/60 bg-card/92 p-5 shadow-[0_20px_50px_rgb(15_23_42/0.07)]">
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
                  <Info class="h-4 w-4 text-primary" />
                </div>
                <div class="space-y-2">
                  <h3 class="text-sm font-semibold text-foreground">Form guidance</h3>
                  <p class="text-xs leading-relaxed text-muted-foreground">
                    Required fields are highlighted automatically. Keep the name concise, descriptions actionable, and dates aligned with milestones.
                  </p>
                </div>
              </div>

              <div class="mt-4 grid gap-3">
                <div class="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best practice</p>
                  <p class="mt-1 text-xs text-foreground">Capture purpose, ownership, and timing so every record is clear at a glance.</p>
                </div>
                <div class="rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Keyboard</p>
                  <div class="mt-1 flex items-center gap-2 text-xs text-foreground">
                    <kbd class="rounded-lg border border-border bg-card px-2 py-1 font-mono text-[11px]">⌘S</kbd>
                    <kbd class="rounded-lg border border-border bg-card px-2 py-1 font-mono text-[11px]">Ctrl+S</kbd>
                    <span class="text-muted-foreground">Save quickly</span>
                  </div>
                </div>
              </div>
            </div>

            <slot name="sidebar" />
          </div>
        </aside>
      </div>
    </div>

    <div class="sticky bottom-0 z-30 border-t border-border/60 bg-background/88 backdrop-blur-xl md:hidden">
      <div class="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          class="h-11 flex-1 rounded-2xl border border-border/60 bg-card text-muted-foreground"
          @click="onCancel"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="default"
          class="h-11 flex-[1.2] rounded-2xl text-sm font-semibold shadow-[0_12px_24px_rgb(var(--color-primary)/0.22)]"
          :disabled="submitting || (mode === 'edit' && !hasChanges)"
          @click="onSubmit"
        >
          <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ submitLabel ?? (mode === "edit" ? "Save Changes" : "Create") }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { AlertCircle, ArrowLeft, Info, Loader2 } from "lucide-vue-next";
  import { onMounted, onUnmounted } from "vue";

  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
  import { Badge } from "@/components/ui/badge";
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";

  export interface FormBreadcrumb {
    label: string;
    onClick?: () => void;
  }

  const props = withDefaults(
    defineProps<{
      mode?: "create" | "edit";
      loading?: boolean;
      loadingText?: string;
      submitting?: boolean;
      breadcrumbs?: FormBreadcrumb[];
      hasChanges?: boolean;
      errorMessage?: string | null;
      submitLabel?: string;
    }>(),
    {
      mode: "create",
      loading: false,
      loadingText: "Loading…",
      submitting: false,
      breadcrumbs: () => [],
      hasChanges: false,
    },
  );

  const emit = defineEmits<{ submit: []; cancel: [] }>();

  function onSubmit() {
    emit("submit");
  }
  function onCancel() {
    emit("cancel");
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (!props.submitting && !(props.mode === "edit" && !props.hasChanges)) {
        onSubmit();
      }
    }
    if (e.key === "Escape") {
      onCancel();
    }
  }

  onMounted(() => window.addEventListener("keydown", handleKeydown));
  onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<style scoped>
  .fade-fast-enter-active,
  .fade-fast-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
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
