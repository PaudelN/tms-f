<template>
  <div class="space-y-3">
    <!-- Drop zone -->
    <div
      class="relative border-2 border-dashed rounded-xl transition-all duration-150 cursor-pointer overflow-hidden"
      :class="[
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerInput"
    >
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        :accept="acceptStr"
        :multiple="multiple"
        @change="onInputChange"
      />

      <div
        class="py-10 flex flex-col items-center justify-center gap-3 text-center px-6"
      >
        <div
          class="h-12 w-12 rounded-xl flex items-center justify-center transition-colors"
          :class="
            isDragging
              ? 'bg-primary/15 text-primary'
              : 'bg-muted text-muted-foreground'
          "
        >
          <UploadCloud class="h-6 w-6" />
        </div>

        <div>
          <p class="text-sm font-semibold text-foreground">
            <template v-if="isDragging">Drop files here</template>
            <template v-else>
              <span class="text-primary underline underline-offset-2"
                >Click to upload</span
              >
              or drag &amp; drop
            </template>
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ hint }}
          </p>
        </div>
      </div>
    </div>

    <!-- Queue -->
    <TransitionGroup
      v-if="queue.length > 0"
      tag="div"
      class="space-y-1.5"
      name="queue"
    >
      <div
        v-for="item in queue"
        :key="item.id"
        class="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-card"
      >
        <!-- File type icon -->
        <div
          class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold uppercase"
          :class="fileTypeStyle(item.file.type).bg"
        >
          <component
            :is="fileTypeStyle(item.file.type).icon"
            class="h-4 w-4"
            :class="fileTypeStyle(item.file.type).color"
          />
        </div>

        <!-- Name + progress -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium text-foreground truncate">
              {{ item.file.name }}
            </p>
            <div class="flex items-center gap-1.5 shrink-0">
              <!-- Status badge -->
              <span
                v-if="item.status === 'done'"
                class="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"
              >
                <CheckCircle2 class="h-3 w-3" /> Done
              </span>
              <span
                v-else-if="item.status === 'error'"
                class="flex items-center gap-1 text-[10px] font-semibold text-destructive"
              >
                <AlertCircle class="h-3 w-3" /> Failed
              </span>
              <span
                v-else-if="item.status === 'uploading'"
                class="text-[10px] font-semibold text-primary tabular-nums"
              >
                {{ item.progress }}%
              </span>
              <span v-else class="text-[10px] text-muted-foreground">
                {{ humanSize(item.file.size) }}
              </span>

              <!-- Remove btn -->
              <button
                type="button"
                class="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                @click="emit('remove', item.id)"
              >
                <X class="h-3 w-3" />
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div
            v-if="item.status === 'uploading' || item.status === 'done'"
            class="mt-1.5 h-1 rounded-full bg-muted overflow-hidden"
          >
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="item.status === 'done' ? 'bg-emerald-500' : 'bg-primary'"
              :style="{ width: `${item.progress}%` }"
            />
          </div>

          <!-- Error message -->
          <p
            v-if="item.status === 'error' && item.error"
            class="text-[10px] text-destructive mt-0.5"
          >
            {{ item.error }}
          </p>
        </div>
      </div>
    </TransitionGroup>

    <!-- Upload action -->
    <div
      v-if="
        showActions && queue.filter((u) => u.status === 'pending').length > 0
      "
      class="flex items-center justify-between pt-1"
    >
      <span class="text-xs text-muted-foreground">
        {{ queue.filter((u) => u.status === "pending").length }} file(s) ready
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          @click="emit('clear')"
        >
          <X class="h-3 w-3" /> Clear
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          :disabled="uploading"
          @click="emit('upload')"
        >
          <Loader2 v-if="uploading" class="h-3 w-3 animate-spin" />
          <UploadCloud v-else class="h-3 w-3" />
          {{ uploading ? "Uploading…" : "Upload All" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { UploadQueueItem } from "@/stores/media";
  import {
    AlertCircle,
    CheckCircle2,
    File,
    FileAudio,
    FileText,
    FileVideo,
    ImageIcon,
    Loader2,
    UploadCloud,
    X,
  } from "lucide-vue-next";
  import { computed, ref } from "vue";

  const props = defineProps<{
    queue: UploadQueueItem[];
    uploading?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    accept?: string[];
    showActions?: boolean;
    hint?: string;
  }>();

  const emit = defineEmits<{
    (e: "add", files: File[]): void;
    (e: "remove", id: string): void;
    (e: "upload"): void;
    (e: "clear"): void;
  }>();

  const inputRef = ref<HTMLInputElement | null>(null);
  const isDragging = ref(false);

  const acceptStr = computed(
    () =>
      props.accept?.join(",") ??
      "image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
  );

  const hint = computed(
    () => props.hint ?? "Images, videos, documents up to 20 MB",
  );

  function triggerInput() {
    inputRef.value?.click();
  }

  function onInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      emit("add", Array.from(input.files));
      input.value = "";
    }
  }

  function onDrop(e: DragEvent) {
    isDragging.value = false;
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length) emit("add", files);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function humanSize(bytes: number): string {
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
    return `${bytes} B`;
  }

  function fileTypeStyle(mime: string): {
    bg: string;
    icon: any;
    color: string;
  } {
    if (mime.startsWith("image/"))
      return {
        bg: "bg-violet-500/10",
        icon: ImageIcon,
        color: "text-violet-500",
      };
    if (mime.startsWith("video/"))
      return { bg: "bg-rose-500/10", icon: FileVideo, color: "text-rose-500" };
    if (mime.startsWith("audio/"))
      return {
        bg: "bg-amber-500/10",
        icon: FileAudio,
        color: "text-amber-500",
      };
    if (
      mime.includes("pdf") ||
      mime.includes("word") ||
      mime.includes("excel") ||
      mime.includes("sheet") ||
      mime.includes("presentation") ||
      mime === "text/plain" ||
      mime === "text/csv"
    )
      return { bg: "bg-sky-500/10", icon: FileText, color: "text-sky-500" };
    return { bg: "bg-slate-500/10", icon: File, color: "text-slate-500" };
  }
</script>

<style scoped>
  .queue-enter-active,
  .queue-leave-active {
    transition: all 0.2s ease;
  }
  .queue-enter-from,
  .queue-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
</style>
