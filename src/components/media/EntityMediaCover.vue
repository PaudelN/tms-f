<template>
  <div class="space-y-3">
    <!-- Section header -->
    <div class="flex items-center gap-2">
      <component
        :is="sectionIcon"
        class="h-3.5 w-3.5 text-muted-foreground/50"
      />
      <h2
        class="text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none"
      >
        {{ label }}
      </h2>
    </div>

    <!-- Skeleton -->
    <div
      v-if="loading"
      class="h-32 w-full animate-pulse rounded-lg bg-muted/40"
    />

    <!-- Media display -->
    <div
      v-else-if="media"
      class="group relative w-2/6 h-auto overflow-hidden rounded-lg border border-border/40 bg-muted/10"
      :class="isAudio ? 'h-auto' : 'h-32'"
    >
      <!-- ── Image ──────────────────────────────────────────── -->
      <template v-if="isImage">
        <img
          :src="media.url"
          :alt="media.alt ?? label"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div
          class="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100"
        >
          <slot
            name="overlay-actions"
            :media="media"
            :open-picker="openPicker"
            :remove="remove"
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              class="h-8 gap-1.5 text-xs shadow-md text-white hover:text-white hover:bg-white/20"
              @click="openInNewTab"
            >
              <ExternalLinkIcon class="h-3 w-3" /> Open
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              class="h-8 gap-1.5 text-xs shadow-md"
              @click="openPicker"
            >
              <PencilIcon class="h-3 w-3" /> Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              class="h-8 gap-1.5 text-xs shadow-md"
              :disabled="removing"
              @click="remove"
            >
              <Trash2Icon class="h-3 w-3" /> Remove
            </Button>
          </slot>
        </div>
      </template>

      <!-- ── Video ──────────────────────────────────────────── -->
      <template v-else-if="isVideo">
        <video
          ref="videoRef"
          :src="media.url"
          class="h-full w-fit object-cover"
          preload="metadata"
          playsinline
          :controls="videoPlaying"
          @click="toggleVideo"
        />
        <!-- Play overlay when not playing -->
        <div
          v-if="!videoPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          @click="toggleVideo"
        >
          <div
            class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <PlayIcon class="h-4 w-4 text-white ml-0.5" />
          </div>
        </div>
        <!-- Action buttons on hover (only when not playing) -->
        <div
          class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            type="button"
            title="Open in new tab"
            class="h-6 w-6 rounded-md flex items-center justify-center bg-background/90 border border-border/60 backdrop-blur-sm hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
            @click.stop="openInNewTab"
          >
            <ExternalLinkIcon class="h-3 w-3" />
          </button>
          <button
            type="button"
            class="h-6 w-6 rounded-md flex items-center justify-center bg-background/90 border border-border/60 backdrop-blur-sm hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
            @click.stop="openPicker"
          >
            <PencilIcon class="h-3 w-3" />
          </button>
          <button
            type="button"
            class="h-6 w-6 rounded-md flex items-center justify-center bg-background/90 border border-border/60 backdrop-blur-sm hover:border-destructive/40 hover:text-destructive text-muted-foreground transition-colors"
            :disabled="removing"
            @click.stop="remove"
          >
            <Trash2Icon class="h-3 w-3" />
          </button>
        </div>
        <!-- Type badge -->
        <div
          class="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm border bg-rose-500/10 border-rose-500/20 text-rose-600"
        >
          <FileVideoIcon class="h-2.5 w-2.5" /> video
        </div>
      </template>

      <!-- ── Audio ──────────────────────────────────────────── -->
      <template v-else-if="isAudio">
        <div class="flex flex-col gap-3 px-4 py-4">
          <!-- Header row -->
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"
            >
              <Music2Icon class="h-5 w-5 text-amber-500" />
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="text-[12px] font-semibold text-foreground truncate leading-tight"
              >
                {{ media.original_filename ?? media.filename }}
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">
                {{ media.human_size }} · audio
              </p>
            </div>
            <!-- Open / Edit / Remove -->
            <div class="flex gap-1 shrink-0">
              <button
                type="button"
                title="Open in new tab"
                class="h-6 w-6 rounded-md flex items-center justify-center border border-border/60 bg-muted/30 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                @click="openInNewTab"
              >
                <ExternalLinkIcon class="h-3 w-3" />
              </button>
              <button
                type="button"
                class="h-6 w-6 rounded-md flex items-center justify-center border border-border/60 bg-muted/30 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                @click="openPicker"
              >
                <PencilIcon class="h-3 w-3" />
              </button>
              <button
                type="button"
                class="h-6 w-6 rounded-md flex items-center justify-center border border-border/60 bg-muted/30 hover:border-destructive/40 hover:text-destructive text-muted-foreground transition-colors"
                :disabled="removing"
                @click="remove"
              >
                <Trash2Icon class="h-3 w-3" />
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="space-y-1.5">
            <div
              class="relative h-1.5 w-full rounded-full bg-muted/50 cursor-pointer overflow-hidden"
              @click="seekAudio"
            >
              <div
                class="absolute inset-y-0 left-0 rounded-full bg-amber-500/70 transition-all duration-100"
                :style="{ width: `${audioProgress}%` }"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] tabular-nums text-muted-foreground">
                {{ formatTime(audioCurrent) }}
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                  @click="skipAudio(-10)"
                >
                  <RotateCcwIcon class="h-3 w-3" />
                </button>
                <button
                  type="button"
                  class="h-7 w-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/25 transition-colors"
                  @click="toggleAudio"
                >
                  <PauseIcon
                    v-if="audioPlaying"
                    class="h-3.5 w-3.5 text-amber-600"
                  />
                  <PlayIcon v-else class="h-3.5 w-3.5 text-amber-600 ml-0.5" />
                </button>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                  @click="skipAudio(10)"
                >
                  <RotateCwIcon class="h-3 w-3" />
                </button>
              </div>
              <span class="text-[10px] tabular-nums text-muted-foreground">
                {{ formatTime(audioDuration) }}
              </span>
            </div>
          </div>
        </div>
        <audio
          ref="audioRef"
          :src="media.url"
          preload="metadata"
          class="hidden"
          @timeupdate="onAudioTimeUpdate"
          @loadedmetadata="onAudioMetadata"
          @ended="audioPlaying = false"
        />
      </template>

      <!-- ── Document / PDF / Other icon fallback ───────────── -->
      <template v-else>
        <div class="h-full flex items-center gap-4 px-4" :class="fileStyle.bg">
          <div
            class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border"
            :class="[fileStyle.iconBg, fileStyle.border]"
          >
            <component
              :is="fileTypeIcon"
              class="h-6 w-6"
              :class="fileStyle.icon"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p
              class="text-[12px] font-semibold text-foreground truncate leading-tight"
            >
              {{ media.original_filename ?? media.filename }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span
                class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border"
                :class="[
                  fileStyle.badgeBg,
                  fileStyle.badgeBorder,
                  fileStyle.badgeText,
                ]"
              >
                {{ media.extension ?? media.aggregate_type }}
              </span>
              <span class="text-[10px] text-muted-foreground">{{
                media.human_size
              }}</span>
            </div>
          </div>
          <!-- Open / Edit / Remove -->
          <div class="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              title="Open in new tab"
              class="h-7 w-7 rounded-md flex items-center justify-center border border-border/60 bg-muted/30 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
              @click="openInNewTab"
            >
              <ExternalLinkIcon class="h-3 w-3" />
            </button>
            <button
              type="button"
              class="h-7 w-7 rounded-md flex items-center justify-center border border-border/60 bg-muted/30 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
              @click="openPicker"
            >
              <PencilIcon class="h-3 w-3" />
            </button>
            <button
              type="button"
              class="h-7 w-7 rounded-md flex items-center justify-center border border-border/60 bg-muted/30 hover:border-destructive/40 hover:text-destructive text-muted-foreground transition-colors"
              :disabled="removing"
              @click="remove"
            >
              <Trash2Icon class="h-3 w-3" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="rounded-lg border border-dashed border-border/60 bg-muted/10 h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/20 hover:border-primary/30 transition-all duration-200 group"
      @click="openPicker"
    >
      <component
        :is="sectionIcon"
        class="h-7 w-7 opacity-20 group-hover:opacity-40 transition-opacity duration-200"
      />
      <p
        class="text-[11px] font-medium opacity-40 group-hover:opacity-60 transition-opacity duration-200"
      >
        {{ emptyText }}
      </p>
    </div>

    <!--
      MediaPicker only mounts when morphType is a known MorphType value.
      This is where the string → MorphType narrowing is enforced at the
      template level, eliminating the TS2322 assignability error.
    -->
    <MediaPicker
      v-if="morphId && resolvedMorphType"
      ref="pickerRef"
      :morph-type="resolvedMorphType"
      :morph-id="morphId"
      :tag="tag"
      :filter-type="filterType"
      :multiple="false"
      :title="pickerTitle"
      @confirm="onMediaSelected"
    />
  </div>
</template>

<script setup lang="ts">
  import { MediaPicker } from "@/components/media";
  import Button from "@/components/ui/button/Button.vue";
  import { notify } from "@/helpers/toast";
  import axios from "@/lib/axios";
  import {
    type AggregateType,
    type Media,
    type MorphType,
    useMediaStore,
  } from "@/stores/media";
  import {
    ExternalLink as ExternalLinkIcon,
    File,
    FileAudio,
    FileText,
    FileVideo as FileVideoIcon,
    FileWarning,
    ImageIcon,
    Music2Icon,
    PauseIcon,
    PencilIcon,
    PlayIcon,
    RotateCcwIcon,
    RotateCwIcon,
    Trash2Icon,
  } from "lucide-vue-next";
  import { computed, onBeforeUnmount, ref, watch } from "vue";

  // ── Known morph types ─────────────────────────────────────────────────────────
  // Must stay in sync with the MorphType union in the store and the Laravel
  // `whereIn` constraint in api.php.
  const KNOWN_MORPH_TYPES: readonly MorphType[] = [
    "tasks",
    "users",
    "projects",
    "pipelines",
    "workspaces",
  ] as const;

  // ── Props ─────────────────────────────────────────────────────────────────────

  const props = withDefaults(
    defineProps<{
      /**
       * Polymorphic model type, e.g. "projects", "clients", "tickets".
       *
       * Intentionally typed as `string` (not `MorphType`) so that any entity
       * detail page can pass its morph slug without importing MorphType.
       * The component narrows the value internally via `resolvedMorphType`.
       * If the value is not in KNOWN_MORPH_TYPES the MediaPicker simply won't
       * mount — load() still works because it hits the generic model-media
       * endpoint directly.
       */
      morphType: string;
      /** Model ID — null while parent is still loading */
      morphId: number | null | undefined;
      /** Spatie media tag (default: "cover") */
      tag?: string;
      /** Section header label */
      label?: string;
      /** Restrict the picker to a single file type */
      filterType?: AggregateType;
      /** MediaPicker dialog title */
      pickerTitle?: string;
      /** Empty-state hint text */
      emptyText?: string;
    }>(),
    {
      tag: "cover",
      label: "Cover",
      pickerTitle: "Choose Media",
      emptyText: "Click to attach a file",
    },
  );

  const emit = defineEmits<{
    (e: "change", media: Media | null): void;
  }>();

  // ── string → MorphType narrowing ──────────────────────────────────────────────
  //
  // This computed is the single source of truth for the narrowed type.
  // - Used as `:morph-type` on <MediaPicker> (the v-if guards the mount).
  // - Used in `onMediaSelected` and `remove` when calling store methods that
  //   require MorphType — those also guard on `resolvedMorphType.value` first.

  const resolvedMorphType = computed<MorphType | null>(() =>
    (KNOWN_MORPH_TYPES as readonly string[]).includes(props.morphType)
      ? (props.morphType as MorphType)
      : null,
  );

  // ── State ─────────────────────────────────────────────────────────────────────

  const mediaStore = useMediaStore();
  const pickerRef = ref<InstanceType<typeof MediaPicker> | null>(null);
  const media = ref<Media | null>(null);
  const loading = ref(false);
  const removing = ref(false);

  const audioRef = ref<HTMLAudioElement | null>(null);
  const audioPlaying = ref(false);
  const audioCurrent = ref(0);
  const audioDuration = ref(0);

  const videoRef = ref<HTMLVideoElement | null>(null);
  const videoPlaying = ref(false);

  // ── Media type helpers ────────────────────────────────────────────────────────

  const isImage = computed(() => media.value?.aggregate_type === "image");
  const isVideo = computed(() => media.value?.aggregate_type === "video");
  const isAudio = computed(() => media.value?.aggregate_type === "audio");

  const sectionIcon = computed(() => {
    if (!media.value) return ImageIcon;
    return (
      (
        {
          image: ImageIcon,
          video: FileVideoIcon,
          audio: FileAudio,
          document: FileText,
          other: File,
        } as Record<string, unknown>
      )[media.value.aggregate_type] ?? File
    );
  });

  const fileStyles: Record<
    string,
    {
      bg: string;
      iconBg: string;
      border: string;
      icon: string;
      badgeBg: string;
      badgeBorder: string;
      badgeText: string;
    }
  > = {
    document: {
      bg: "bg-sky-500/5",
      iconBg: "bg-sky-500/10",
      border: "border-sky-500/20",
      icon: "text-sky-500",
      badgeBg: "bg-sky-500/10",
      badgeBorder: "border-sky-500/20",
      badgeText: "text-sky-600",
    },
    pdf: {
      bg: "bg-red-500/5",
      iconBg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "text-red-500",
      badgeBg: "bg-red-500/10",
      badgeBorder: "border-red-500/20",
      badgeText: "text-red-600",
    },
    other: {
      bg: "bg-slate-500/5",
      iconBg: "bg-slate-500/10",
      border: "border-slate-500/20",
      icon: "text-slate-500",
      badgeBg: "bg-slate-500/10",
      badgeBorder: "border-slate-500/20",
      badgeText: "text-slate-600",
    },
  };

  function resolveFileStyleKey(m: Media): string {
    if (m.extension?.toLowerCase() === "pdf") return "pdf";
    if (m.aggregate_type === "document") return "document";
    return "other";
  }

  const fileStyle = computed(() =>
    media.value
      ? (fileStyles[resolveFileStyleKey(media.value)] ?? fileStyles.other)
      : fileStyles.other,
  );

  const fileTypeIcon = computed(() => {
    if (!media.value) return File;
    if (media.value.extension?.toLowerCase() === "pdf") return FileWarning;
    if (media.value.aggregate_type === "document") return FileText;
    return File;
  });

  const audioProgress = computed(() =>
    audioDuration.value > 0
      ? (audioCurrent.value / audioDuration.value) * 100
      : 0,
  );

  // ── Open in new tab ───────────────────────────────────────────────────────────

  function openInNewTab(): void {
    if (media.value?.url) {
      window.open(media.value.url, "_blank", "noopener,noreferrer");
    }
  }

  // ── API helpers ───────────────────────────────────────────────────────────────

  async function load(): Promise<void> {
    if (!props.morphId) return;
    loading.value = true;
    try {
      const { data } = await axios.get<{ data: Media[] }>(
        `/${props.morphType}/${props.morphId}/media`,
        { params: { tag: props.tag, per_page: 1, page: 1 } },
      );
      media.value = data.data?.[0] ?? null;
    } catch {
      media.value = null;
    } finally {
      loading.value = false;
    }
  }

  function openPicker(): void {
    pickerRef.value?.show();
  }

  async function onMediaSelected(selected: Media[]): Promise<void> {
    if (!props.morphId || !resolvedMorphType.value || !selected.length) return;
    try {
      if (media.value) {
        await mediaStore.detachFromModel(
          media.value.id,
          resolvedMorphType.value,
          props.morphId,
          props.tag,
        );
      }
      await mediaStore.attachExisting(
        selected[0].id,
        resolvedMorphType.value,
        props.morphId,
        props.tag,
      );
      media.value = selected[0];
      emit("change", media.value);
      notify.success(`${props.label} updated`, "The file has been saved.");
    } catch {
      notify.error(
        "Error",
        `Could not update the ${props.label.toLowerCase()}.`,
      );
    }
  }

  async function remove(): Promise<void> {
    if (!props.morphId || !resolvedMorphType.value || !media.value) return;
    removing.value = true;
    try {
      await mediaStore.detachFromModel(
        media.value.id,
        resolvedMorphType.value,
        props.morphId,
        props.tag,
      );
      media.value = null;
      emit("change", null);
      notify.success(`${props.label} removed`);
    } catch {
      notify.error(
        "Error",
        `Could not remove the ${props.label.toLowerCase()}.`,
      );
    } finally {
      removing.value = false;
    }
  }

  // ── Audio controls ────────────────────────────────────────────────────────────

  function toggleAudio(): void {
    const el = audioRef.value;
    if (!el) return;
    if (el.paused) {
      el.play();
      audioPlaying.value = true;
    } else {
      el.pause();
      audioPlaying.value = false;
    }
  }

  function skipAudio(seconds: number): void {
    if (!audioRef.value) return;
    audioRef.value.currentTime = Math.max(
      0,
      Math.min(audioRef.value.currentTime + seconds, audioDuration.value),
    );
  }

  function seekAudio(e: MouseEvent): void {
    const el = audioRef.value;
    if (!el || !audioDuration.value) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    el.currentTime =
      ((e.clientX - rect.left) / rect.width) * audioDuration.value;
  }

  function onAudioTimeUpdate(): void {
    audioCurrent.value = audioRef.value?.currentTime ?? 0;
  }
  function onAudioMetadata(): void {
    audioDuration.value = audioRef.value?.duration ?? 0;
  }

  function formatTime(s: number): string {
    if (!isFinite(s)) return "—";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  // ── Video controls ────────────────────────────────────────────────────────────

  function toggleVideo(): void {
    const el = videoRef.value;
    if (!el) return;
    if (el.paused) {
      el.play();
      videoPlaying.value = true;
    } else {
      el.pause();
      videoPlaying.value = false;
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  watch(
    () => props.morphId,
    (id) => {
      if (id) load();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    audioRef.value?.pause();
    videoRef.value?.pause();
  });

  defineExpose({ load });
</script>
