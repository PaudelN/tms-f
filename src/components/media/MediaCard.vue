<template>
  <div
    class="group relative rounded-xl border transition-all duration-150 cursor-pointer select-none overflow-hidden"
    :class="[
      selected
        ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/30 shadow-md'
        : 'border-border bg-card hover:border-primary/30 hover:shadow-sm',
    ]"
    @click="emit('click', item)"
  >
    <!-- Selection checkbox -->
    <div
      class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      :class="{ '!opacity-100': selected }"
      @click.stop="emit('select', item)"
    >
      <div
        class="h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all"
        :class="
          selected
            ? 'bg-primary border-primary'
            : 'bg-background/90 border-border backdrop-blur-sm'
        "
      >
        <Check v-if="selected" class="h-3 w-3 text-primary-foreground" />
      </div>
    </div>

    <!-- Actions -->
    <div
      class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
      @click.stop
    >
      <button
        type="button"
        class="h-6 w-6 rounded-md flex items-center justify-center bg-background/90 border border-border/60 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
        title="Edit alt text"
        @click="emit('edit', item)"
      >
        <Pencil class="h-3 w-3" />
      </button>
      <button
        type="button"
        class="h-6 w-6 rounded-md flex items-center justify-center bg-background/90 border border-border/60 backdrop-blur-sm hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        title="Delete"
        @click="emit('delete', item)"
      >
        <Trash2 class="h-3 w-3" />
      </button>
    </div>

    <!-- Preview area -->
    <div
      ref="previewRef"
      class="relative bg-muted/30 aspect-video flex items-center justify-center overflow-hidden"
    >
      <!-- Skeleton shown only before IntersectionObserver fires -->
      <div v-if="!inView" class="absolute inset-0 animate-pulse bg-muted/60" />

      <template v-else>
        <!-- Image -->
        <img
          v-if="item.aggregate_type === 'image' && !imageError"
          :src="item.url"
          :alt="item.alt ?? item.original_filename ?? ''"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          @error="imageError = true"
        />

        <!-- Video — browser renders first frame as poster -->
        <video
          v-else-if="item.aggregate_type === 'video'"
          :src="item.url"
          class="w-full h-full object-cover"
          preload="metadata"
          muted
          playsinline
        />

        <!-- Icon fallback: audio / document / other / broken image -->
        <div
          v-else
          class="flex flex-col items-center justify-center gap-2 w-full h-full"
          :class="typeColors[item.aggregate_type]?.bg ?? typeColors.other.bg"
        >
          <component
            :is="typeIcon"
            class="h-10 w-10"
            :class="
              typeColors[item.aggregate_type]?.icon ?? typeColors.other.icon
            "
          />
          <span
            class="text-[10px] font-bold uppercase tracking-widest"
            :class="
              typeColors[item.aggregate_type]?.text ?? typeColors.other.text
            "
          >
            {{ item.extension }}
          </span>
        </div>
      </template>

      <!-- Aggregate badge — always visible -->
      <div
        class="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm border"
        :class="
          typeColors[item.aggregate_type]?.badge ?? typeColors.other.badge
        "
      >
        <component :is="typeIcon" class="h-2.5 w-2.5" />
        {{ item.aggregate_type }}
      </div>
    </div>

    <!-- Info footer -->
    <div class="px-3 py-2.5">
      <p class="text-xs font-medium text-foreground truncate leading-tight">
        {{ item.original_filename ?? item.filename }}
      </p>
      <div class="flex items-center justify-between mt-1 gap-2">
        <span class="text-[10px] text-muted-foreground">{{
          item.human_size
        }}</span>
        <span class="text-[10px] text-muted-foreground">{{
          formattedDate
        }}</span>
      </div>
      <p
        v-if="item.alt"
        class="text-[10px] text-muted-foreground truncate mt-0.5 italic"
      >
        {{ item.alt }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Media } from "@/stores/media";
  import {
    Check,
    File,
    FileAudio,
    FileText,
    FileVideo,
    ImageIcon,
    Pencil,
    Trash2,
  } from "lucide-vue-next";
  import { computed, onBeforeUnmount, onMounted, ref } from "vue";

  // ── Props / emits ─────────────────────────────────────────────────────────────

  const props = defineProps<{
    item: Media;
    selected?: boolean;
  }>();

  const emit = defineEmits<{
    (e: "click", item: Media): void;
    (e: "select", item: Media): void;
    (e: "edit", item: Media): void;
    (e: "delete", item: Media): void;
  }>();

  // ── State ─────────────────────────────────────────────────────────────────────

  const imageError = ref(false);
  const inView = ref(true);
  const previewRef = ref<HTMLElement | null>(null);

  // ── Lazy loading via IntersectionObserver ─────────────────────────────────────

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!("IntersectionObserver" in window)) return;
    inView.value = false;
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView.value = true;
          observer?.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    if (previewRef.value) observer.observe(previewRef.value);
  });

  onBeforeUnmount(() => observer?.disconnect());

  // ── Type styling ──────────────────────────────────────────────────────────────

  const typeColors: Record<
    string,
    { bg: string; icon: string; text: string; badge: string }
  > = {
    image: {
      bg: "bg-violet-500/8",
      icon: "text-violet-500",
      text: "text-violet-600",
      badge: "bg-violet-500/10 border-violet-500/20 text-violet-600",
    },
    video: {
      bg: "bg-rose-500/8",
      icon: "text-rose-500",
      text: "text-rose-600",
      badge: "bg-rose-500/10 border-rose-500/20 text-rose-600",
    },
    audio: {
      bg: "bg-amber-500/8",
      icon: "text-amber-500",
      text: "text-amber-600",
      badge: "bg-amber-500/10 border-amber-500/20 text-amber-600",
    },
    document: {
      bg: "bg-sky-500/8",
      icon: "text-sky-500",
      text: "text-sky-600",
      badge: "bg-sky-500/10 border-sky-500/20 text-sky-600",
    },
    other: {
      bg: "bg-slate-500/8",
      icon: "text-slate-500",
      text: "text-slate-600",
      badge: "bg-slate-500/10 border-slate-500/20 text-slate-600",
    },
  };

  const typeIconMap: Record<string, unknown> = {
    image: ImageIcon,
    video: FileVideo,
    audio: FileAudio,
    document: FileText,
    other: File,
  };

  const typeIcon = computed(
    () => typeIconMap[props.item.aggregate_type] ?? File,
  );

  const formattedDate = computed(() => {
    if (!props.item.created_at) return "";
    return new Date(props.item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });
</script>
