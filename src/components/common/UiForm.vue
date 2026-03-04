<template>
  <div class="flex flex-col bg-background p-2">
    <div
      class="sticky top-0 z-50 shrink-0 h-10"
      style="box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.06)"
    >
      <div
        class="h-full max-w-full mx-auto px-4 flex items-center justify-between gap-4"
      >
        <!-- Left: back + breadcrumbs -->
        <div class="flex items-center gap-3 min-w-0">
          <Breadcrumb>
            <BreadcrumbList class="gap-1 flex-nowrap min-w-0">
              <template v-for="(crumb, i) in breadcrumbs" :key="i">
                <BreadcrumbItem class="min-w-0">
                  <BreadcrumbPage
                    v-if="i === breadcrumbs.length - 1"
                    class="text-[12px] font-semibold text-foreground truncate max-w-40"
                  >
                    {{ crumb.label }}
                  </BreadcrumbPage>
                  <BreadcrumbLink
                    v-else
                    as="button"
                    class="text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap"
                    @click="crumb.onClick?.()"
                  >
                    {{ crumb.label }}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator
                  v-if="i < breadcrumbs.length - 1"
                  class="text-muted-foreground"
                />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
          <Transition name="fade-fast">
            <Badge
              v-if="hasChanges && mode === 'edit'"
              variant="default"
              class="text-[10px] bg-primary font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs"
            >
              Unsaved changes
            </Badge>
          </Transition>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="header"
            shape="circle"
            size="icon"
            class="relative cursor-pointer flex items-center justify-center w-8 h-8 rounded-[9999px] transition-all duration-200 text-primary bg-primary-20"
            @click="onCancel"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- ── Loading State ─────────────────────────────────────────────────── -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-5">
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 rounded-full border-2 border-muted" />
          <div
            class="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style="border-top-color: rgb(var(--color-primary))"
          />
        </div>
        <div class="text-center">
          <p class="text-[13px] font-semibold text-foreground">
            {{ loadingText }}
          </p>
          <p class="text-[11px] text-muted-foreground mt-0.5">Please wait…</p>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div class="max-w-full mx-auto p-10">
        <div
          class="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_450px] gap-10 items-start"
        >
          <!-- Form Column -->
          <div class="space-y-5">
            <Transition name="slide-down">
              <Alert
                v-if="errorMessage"
                variant="destructive"
                class="border-destructive bg-card"
                style="box-shadow: 0 0 0 4px rgb(239 68 68 / 0.08)"
              >
                <AlertCircle class="h-4 w-4" />
                <AlertTitle class="text-[13px] font-semibold"
                  >Something went wrong</AlertTitle
                >
                <AlertDescription class="text-[12px] leading-relaxed mt-0.5">
                  {{ errorMessage }}
                </AlertDescription>
              </Alert>
            </Transition>

            <!-- Card wrapper for form -->
            <Card class="border-border rounded-sm shadow-soft overflow-hidden">
              <CardContent class="p-0">
                <slot name="fields" />
              </CardContent>
            </Card>
          </div>

          <!-- Sidebar Column -->
          <div class="space-y-3">
            <slot name="sidebar">
              <!-- Default: form guidance card -->
              <Card class="border-border">
                <CardHeader class="pb-3 pt-5 px-5">
                  <div class="flex items-center gap-2">
                    <div
                      class="h-7 w-7 rounded-lg bg-primary-20 flex items-center justify-center"
                    >
                      <Info class="h-3.5 w-3.5 text-primary" />
                    </div>
                    <CardTitle class="text-[13px] font-semibold"
                      >About this form</CardTitle
                    >
                  </div>
                </CardHeader>
                <CardContent class="px-5 pb-5 pt-0 space-y-3">
                  <p class="text-[12px] text-muted-foreground leading-relaxed">
                    Fill in all required fields marked with
                    <span class="text-destructive font-bold">*</span>. Your
                    changes are not saved until you click the
                    <strong class="text-foreground font-semibold">{{
                      submitLabel ??
                      (mode === "edit" ? "Save Changes" : "Create")
                    }}</strong>
                    button.
                  </p>
                  <Separator />
                  <div class="space-y-2">
                    <div
                      class="flex items-center gap-2 text-[11px] text-muted-foreground"
                    >
                      <kbd
                        class="inline-flex h-5 items-center px-1.5 rounded border border-border bg-muted font-mono text-[10px] font-medium"
                        >⌘S</kbd
                      >
                      <span>Save changes</span>
                    </div>
                    <div
                      class="flex items-center gap-2 text-[11px] text-muted-foreground"
                    >
                      <kbd
                        class="inline-flex h-5 items-center px-1.5 rounded border border-border bg-muted font-mono text-[10px] font-medium"
                        >Esc</kbd
                      >
                      <span>Discard & go back</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </slot>
          </div>

          <div
            v-if="!loading"
            style="box-shadow: 0 -4px 16px rgb(0 0 0 / 0.06)"
            class=""
          >
            <div class="max-w-7xl mx-auto flex items-center justify-between">
              <div
                class="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <kbd
                  class="inline-flex h-5 items-center px-1.5 rounded border border-border bg-muted font-mono text-[10px] font-medium"
                  >cmd/⌘ + S</kbd
                >
                <span>to save</span>
              </div>

              <div class="flex items-center gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  class="h-9 px-4 cursor-pointer text-[13px] hover:text-foreground rounded-sm"
                  @click="onCancel"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  class="h-9 px-5 cursor-pointer text-[13px] font-semibold rounded-sm gap-2 hover:bg-violet-600"
                  style="box-shadow: 0 1px 3px rgb(0 0 0 / 0.15)"
                  :disabled="submitting || (mode === 'edit' && !hasChanges)"
                  @click="onSubmit"
                >
                  <Loader2 v-if="submitting" class="h-3.5 w-3.5 animate-spin" />
                  {{
                    submitLabel ?? (mode === "edit" ? "Save Changes" : "Create")
                  }}
                </Button>
              </div>
            </div>
          </div>
        </div>
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
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";

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
