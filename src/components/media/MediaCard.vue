<script setup lang="ts">
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
  import type { Media } from "@/stores/media";
  import {
    CopyIcon,
    DownloadIcon,
    ExternalLinkIcon,
    FileIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    FilmIcon,
    ImageIcon,
    MoreVerticalIcon,
    PencilIcon,
    TrashIcon,
  } from "lucide-vue-next";
  import { computed } from "vue";

  // ── Props ──────────────────────────────────────────────────────────────────────

  const props = withDefaults(
    defineProps<{
      media: Media;
      selectable?: boolean;
      selected?: boolean;
      compact?: boolean;
    }>(),
    {
      selectable: false,
      selected: false,
      compact: false,
    },
  );

  // ── Emits ──────────────────────────────────────────────────────────────────────

  const emit = defineEmits<{
    edit: [media: Media];
    delete: [media: Media];
    select: [media: Media];
    preview: [media: Media];
  }>();

  // ── Computed ───────────────────────────────────────────────────────────────────

  const isImage = computed(() => props.media.type === "image");
  const isVideo = computed(() => props.media.type === "video");

  const isPdf = computed(() => props.media.mime_type === "application/pdf");
  const isSpreadsheet = computed(
    () =>
      props.media.mime_type.includes("spreadsheet") ||
      props.media.mime_type.includes("excel") ||
      props.media.mime_type === "text/csv",
  );

  const typeIcon = computed(() => {
    if (props.media.type === "image") return ImageIcon;
    if (props.media.type === "video") return FilmIcon;
    if (props.media.type === "document") {
      return isSpreadsheet.value ? FileSpreadsheetIcon : FileTextIcon;
    }
    return FileIcon;
  });

  const fileExtension = computed(() => {
    const parts = props.media.mime_type.split("/");
    return parts[1]?.toUpperCase() ?? props.media.type.toUpperCase();
  });

  const iconColorClass = computed(() => {
    if (isPdf.value) return "text-rose-500";
    if (isSpreadsheet.value) return "text-emerald-500";
    return "text-blue-500";
  });

  const cardClasses = computed(() => [
    "group relative flex flex-col rounded-lg border bg-card transition-all duration-200",
    "hover:shadow-md hover:border-primary/30",
    props.selected ? "ring-2 ring-primary border-primary/50 bg-primary/5" : "",
    props.selectable ? "cursor-pointer select-none" : "",
    "overflow-hidden",
  ]);

  // ── Helpers ────────────────────────────────────────────────────────────────────

  function copyUrl(): void {
    void navigator.clipboard.writeText(props.media.url);
  }

  function openInNew(): void {
    window.open(props.media.url, "_blank", "noopener,noreferrer");
  }

  function download(): void {
    const a = document.createElement("a");
    a.href = props.media.url;
    a.download = props.media.original_name;
    a.click();
  }

  function truncateName(name: string, max = 28): string {
    return name.length > max ? `${name.slice(0, max - 1)}…` : name;
  }
</script>

<template>
  <div
    :class="cardClasses"
    @click="selectable ? emit('select', media) : undefined"
  >
    <!-- Thumbnail / Preview Area -->
    <div
      class="relative w-full overflow-hidden bg-muted/50"
      :class="compact ? 'aspect-square' : 'aspect-[16/10]'"
    >
      <!-- Image -->
      <img
        v-if="isImage"
        :src="media.url"
        :alt="media.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      <!-- Video placeholder -->
      <div
        v-else-if="isVideo"
        class="flex h-full w-full items-center justify-center bg-muted/80"
      >
        <FilmIcon class="h-10 w-10 text-muted-foreground/60" />
      </div>

      <!-- File icon -->
      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30"
      >
        <component :is="typeIcon" class="h-10 w-10" :class="iconColorClass" />
        <span
          class="text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
        >
          {{ fileExtension }}
        </span>
      </div>

      <!-- Selected overlay -->
      <Transition name="fade">
        <div
          v-if="selected && selectable"
          class="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]"
        >
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </Transition>

      <!-- Actions — top right (non-selectable mode only) -->
      <div
        v-if="!selectable"
        class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        @click.stop
      >
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              size="icon"
              variant="secondary"
              class="h-7 w-7 rounded-md shadow-sm"
            >
              <MoreVerticalIcon class="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuItem @click="emit('preview', media)">
              <ExternalLinkIcon class="mr-2 h-3.5 w-3.5" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem @click="copyUrl">
              <CopyIcon class="mr-2 h-3.5 w-3.5" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem @click="download">
              <DownloadIcon class="mr-2 h-3.5 w-3.5" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="emit('edit', media)">
              <PencilIcon class="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive focus:text-destructive"
              @click="emit('delete', media)"
            >
              <TrashIcon class="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Footer info (non-compact only) -->
    <div v-if="!compact" class="flex flex-col gap-1 p-3">
      <TooltipProvider :delay-duration="300">
        <Tooltip>
          <TooltipTrigger as-child>
            <p
              class="truncate text-[13px] font-medium leading-tight text-foreground"
            >
              {{ truncateName(media.name) }}
            </p>
          </TooltipTrigger>
          <TooltipContent>{{ media.name }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] text-muted-foreground">{{
          media.human_size
        }}</span>
        <Badge variant="secondary" class="h-4 px-1.5 text-[10px]">
          {{ media.type }}
        </Badge>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
