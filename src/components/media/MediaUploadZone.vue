<script setup lang="ts">
  import { Button } from "@/components/ui/button";
  import { Progress } from "@/components/ui/progress";
  import {
    CheckCircle2Icon,
    FileIcon,
    UploadCloudIcon,
    XIcon,
  } from "lucide-vue-next";
  import { computed, ref } from "vue";

  // ── Types ──────────────────────────────────────────────────────────────────────

  export interface UploadQueueItem {
    id: string;
    file: File;
    name: string;
    progress: number;
    status: "pending" | "uploading" | "done" | "error";
    error?: string;
  }

  // ── Props / Emits ──────────────────────────────────────────────────────────────

  const props = withDefaults(
    defineProps<{
      accept?: string;
      maxSizeMb?: number;
      multiple?: boolean;
      disabled?: boolean;
    }>(),
    {
      accept: "image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt",
      maxSizeMb: 20,
      multiple: true,
      disabled: false,
    },
  );

  const emit = defineEmits<{
    upload: [files: File[]];
  }>();

  // ── State ──────────────────────────────────────────────────────────────────────

  const isDragging = ref(false);
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const queue = ref<UploadQueueItem[]>([]);

  // ── Computed ───────────────────────────────────────────────────────────────────

  const hasQueue = computed(() => queue.value.length > 0);
  const overallProgress = computed(() => {
    if (!queue.value.length) return 0;
    const sum = queue.value.reduce((acc, i) => acc + i.progress, 0);
    return Math.round(sum / queue.value.length);
  });
  const isAnyUploading = computed(() =>
    queue.value.some((i) => i.status === "uploading"),
  );
  const maxBytes = computed(() => props.maxSizeMb * 1024 * 1024);

  // ── Drag Events ────────────────────────────────────────────────────────────────

  function onDragOver(e: DragEvent): void {
    e.preventDefault();
    isDragging.value = true;
  }

  function onDragLeave(): void {
    isDragging.value = false;
  }

  function onDrop(e: DragEvent): void {
    e.preventDefault();
    isDragging.value = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    handleFiles(files);
  }

  function onInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    handleFiles(files);
    input.value = "";
  }

  // ── File Handling ──────────────────────────────────────────────────────────────

  function handleFiles(files: File[]): void {
    if (props.disabled) return;
    const valid = files.filter((f) => f.size <= maxBytes.value);
    if (valid.length) emit("upload", valid);
  }

  // ── Queue Management (exposed for parent) ─────────────────────────────────────

  function addToQueue(file: File): UploadQueueItem {
    const item: UploadQueueItem = {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      progress: 0,
      status: "pending",
    };
    queue.value.push(item);
    return item;
  }

  function updateProgress(id: string, progress: number): void {
    const item = queue.value.find((i) => i.id === id);
    if (item) {
      item.progress = progress;
      item.status = "uploading";
    }
  }

  function markDone(id: string): void {
    const item = queue.value.find((i) => i.id === id);
    if (item) {
      item.progress = 100;
      item.status = "done";
    }
  }

  function markError(id: string, message: string): void {
    const item = queue.value.find((i) => i.id === id);
    if (item) {
      item.status = "error";
      item.error = message;
    }
  }

  function removeFromQueue(id: string): void {
    queue.value = queue.value.filter((i) => i.id !== id);
  }

  function clearQueue(): void {
    queue.value = [];
  }

  // ── Expose ─────────────────────────────────────────────────────────────────────

  defineExpose({
    queue,
    addToQueue,
    updateProgress,
    markDone,
    markError,
    removeFromQueue,
    clearQueue,
  });
</script>

<template>
  <div class="space-y-3">
    <!-- Drop Zone -->
    <div
      class="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200"
      :class="[
        isDragging
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/30',
        disabled && 'pointer-events-none opacity-50',
      ]"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border"
      >
        <UploadCloudIcon
          class="h-6 w-6 transition-colors"
          :class="isDragging ? 'text-primary' : 'text-muted-foreground'"
        />
      </div>

      <div class="space-y-1">
        <p class="text-sm font-medium text-foreground">
          <button
            type="button"
            class="cursor-pointer text-primary underline-offset-2 hover:underline focus:outline-none"
            :disabled="disabled"
            @click="fileInputRef?.click()"
          >
            Click to upload
          </button>
          {{ " " }}or drag &amp; drop
        </p>
        <p class="text-xs text-muted-foreground">
          Images, videos, PDFs, documents — up to {{ maxSizeMb }}MB each
        </p>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="onInputChange"
      />
    </div>

    <!-- Upload Queue -->
    <Transition name="slide-down">
      <div v-if="hasQueue" class="space-y-2">
        <Progress
          v-if="isAnyUploading"
          :model-value="overallProgress"
          class="h-1"
        />

        <div class="space-y-1.5 rounded-lg border bg-card p-3">
          <TransitionGroup name="list" tag="div" class="space-y-1.5">
            <div
              v-for="item in queue"
              :key="item.id"
              class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm"
              :class="
                item.status === 'error' ? 'bg-destructive/10' : 'bg-muted/30'
              "
            >
              <!-- Status icon -->
              <div class="shrink-0">
                <CheckCircle2Icon
                  v-if="item.status === 'done'"
                  class="h-4 w-4 text-emerald-500"
                />
                <div
                  v-else-if="item.status === 'uploading'"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                />
                <FileIcon v-else class="h-4 w-4 text-muted-foreground" />
              </div>

              <!-- Name + progress -->
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium">{{ item.name }}</p>
                <Progress
                  v-if="item.status === 'uploading'"
                  :model-value="item.progress"
                  class="mt-1 h-1"
                />
                <p
                  v-if="item.status === 'error'"
                  class="mt-0.5 text-[11px] text-destructive"
                >
                  {{ item.error ?? "Upload failed" }}
                </p>
              </div>

              <!-- Remove (not while uploading) -->
              <Button
                v-if="item.status !== 'uploading'"
                type="button"
                size="icon"
                variant="ghost"
                class="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                @click="removeFromQueue(item.id)"
              >
                <XIcon class="h-3 w-3" />
              </Button>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.2s ease;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  .list-enter-active,
  .list-leave-active {
    transition: all 0.2s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(-8px);
  }
</style>
