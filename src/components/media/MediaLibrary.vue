<script setup lang="ts">
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Separator } from "@/components/ui/separator";
  import { Skeleton } from "@/components/ui/skeleton";
  import { notify } from "@/helpers/toast";
  import type { Media, MediaType } from "@/stores/media";
  import { useMediaStore } from "@/stores/media";
  import {
    ChevronDownIcon,
    ExternalLinkIcon,
    FileIcon,
    ImageIcon,
    LayoutGridIcon,
    LayoutListIcon,
    RefreshCwIcon,
  } from "lucide-vue-next";
  import { storeToRefs } from "pinia";
  import { computed, onMounted, ref } from "vue";
  import MediaCard from "./MediaCard.vue";
  import MediaUploadZone from "./MediaUploadZone.vue";

  // ── Props ──────────────────────────────────────────────────────────────────────

  const props = defineProps<{
    projectId: number | any;
  }>();

  // ── Store ──────────────────────────────────────────────────────────────────────

  const mediaStore = useMediaStore();
  const { items, meta, isLoading, isUploading, activeFilter } =
    storeToRefs(mediaStore);

  // ── Local State ────────────────────────────────────────────────────────────────

  type ViewMode = "grid" | "list";
  const viewMode = ref<ViewMode>("grid");
  const uploadZoneRef = ref<InstanceType<typeof MediaUploadZone> | null>(null);

  // Edit dialog
  const editDialogOpen = ref(false);
  const editingMedia = ref<Media | null>(null);
  const editName = ref("");
  const editSaving = ref(false);

  // Delete dialog
  const deleteDialogOpen = ref(false);
  const deletingMedia = ref<Media | null>(null);
  const deleteLoading = ref(false);

  // Preview dialog
  const previewDialogOpen = ref(false);
  const previewMedia = ref<Media | null>(null);

  // ── Filter Tabs ────────────────────────────────────────────────────────────────

  interface FilterTab {
    label: string;
    value: MediaType | "";
  }

  const filterTabs: FilterTab[] = [
    { label: "All", value: "" },
    { label: "Images", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Documents", value: "document" },
    { label: "Other", value: "other" },
  ];

  // ── Computed ───────────────────────────────────────────────────────────────────

  const hasMore = computed(
    () => meta.value.current_page < meta.value.last_page,
  );
  const canSaveEdit = computed(
    () =>
      editName.value.trim().length > 0 &&
      editName.value.trim() !== editingMedia.value?.name,
  );

  // ── Load / Pagination ──────────────────────────────────────────────────────────

  async function loadMedia(reset = true): Promise<void> {
    if (reset) {
      await mediaStore.fetchMedia(props.projectId, {
        page: 1,
        type: activeFilter.value || undefined,
      });
    } else {
      await mediaStore.loadMoreMedia(props.projectId, {
        page: meta.value.current_page + 1,
        type: activeFilter.value || undefined,
      });
    }
  }

  async function onFilterChange(value: MediaType | ""): Promise<void> {
    mediaStore.setFilter(value);
    await loadMedia(true);
  }

  onMounted(() => {
    void loadMedia(true);
  });

  // ── Upload ─────────────────────────────────────────────────────────────────────

  async function handleUploadFiles(files: File[]): Promise<void> {
    for (const file of files) {
      const queueItem = uploadZoneRef.value?.addToQueue(file);
      if (!queueItem) continue;

      try {
        await mediaStore.uploadMedia(props.projectId, { file }, (pct) =>
          uploadZoneRef.value?.updateProgress(queueItem.id, pct),
        );
        uploadZoneRef.value?.markDone(queueItem.id);
        notify.success("Uploaded", `${file.name} uploaded successfully.`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        uploadZoneRef.value?.markError(queueItem.id, msg);
        notify.error("Upload failed", msg);
      }
    }

    // Auto-clear done items
    setTimeout(() => {
      const done =
        uploadZoneRef.value?.queue.value.filter((i) => i.status === "done") ??
        [];
      done.forEach((i) => uploadZoneRef.value?.removeFromQueue(i.id));
    }, 2000);
  }

  // ── Edit ───────────────────────────────────────────────────────────────────────

  function openEdit(media: Media): void {
    editingMedia.value = media;
    editName.value = media.name;
    editDialogOpen.value = true;
  }

  async function submitEdit(): Promise<void> {
    if (!editingMedia.value || !canSaveEdit.value) return;
    editSaving.value = true;
    try {
      await mediaStore.updateMedia(editingMedia.value.id, {
        name: editName.value.trim(),
      });
      notify.success("Renamed", "Media name updated.");
      editDialogOpen.value = false;
    } catch {
      notify.error("Error", mediaStore.errorMessage);
    } finally {
      editSaving.value = false;
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────────

  function openDelete(media: Media): void {
    deletingMedia.value = media;
    deleteDialogOpen.value = true;
  }

  async function confirmDelete(): Promise<void> {
    if (!deletingMedia.value) return;
    deleteLoading.value = true;
    try {
      await mediaStore.deleteMedia(deletingMedia.value.id);
      notify.success("Deleted", "Media file removed.");
      deleteDialogOpen.value = false;
    } catch {
      notify.error("Error", mediaStore.errorMessage);
    } finally {
      deleteLoading.value = false;
    }
  }

  // ── Preview ────────────────────────────────────────────────────────────────────

  function openPreview(media: Media): void {
    previewMedia.value = media;
    previewDialogOpen.value = true;
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Upload Zone -->
    <MediaUploadZone
      ref="uploadZoneRef"
      :disabled="isUploading"
      @upload="handleUploadFiles"
    />

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Filter tabs (plain buttons — no Reka/ToggleGroup) -->
      <div class="flex flex-wrap items-center gap-1">
        <Button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          size="sm"
          :variant="activeFilter === tab.value ? 'default' : 'outline'"
          class="h-7 px-3 text-xs"
          @click="onFilterChange(tab.value)"
        >
          {{ tab.label }}
        </Button>
      </div>

      <!-- Right controls -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">
          {{ meta.total }} file{{ meta.total !== 1 ? "s" : "" }}
        </span>

        <Separator orientation="vertical" class="h-4" />

        <!-- View toggle -->
        <div class="flex items-center rounded-md border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-8 w-8 rounded-r-none border-r"
            :class="viewMode === 'grid' ? 'bg-muted' : ''"
            @click="viewMode = 'grid'"
          >
            <LayoutGridIcon class="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-8 w-8 rounded-l-none"
            :class="viewMode === 'list' ? 'bg-muted' : ''"
            @click="viewMode = 'list'"
          >
            <LayoutListIcon class="h-3.5 w-3.5" />
          </Button>
        </div>

        <!-- Refresh -->
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          :disabled="isLoading"
          @click="loadMedia(true)"
        >
          <RefreshCwIcon
            class="h-3.5 w-3.5"
            :class="isLoading && 'animate-spin'"
          />
        </Button>
      </div>
    </div>

    <!-- Content -->
    <div>
      <!-- Loading skeletons -->
      <div
        v-if="isLoading && !items.length"
        :class="
          viewMode === 'grid'
            ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
            : 'space-y-2'
        "
      >
        <Skeleton
          v-for="n in 8"
          :key="n"
          :class="viewMode === 'grid' ? 'h-44 rounded-lg' : 'h-16 rounded-lg'"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!isLoading && !items.length"
        class="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-16 text-center"
      >
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full bg-muted"
        >
          <ImageIcon class="h-7 w-7 text-muted-foreground" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium">No media yet</p>
          <p class="text-xs text-muted-foreground">
            Upload files above to get started
          </p>
        </div>
      </div>

      <!-- Grid view -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        <MediaCard
          v-for="media in items"
          :key="media.id"
          :media="media"
          @edit="openEdit"
          @delete="openDelete"
          @preview="openPreview"
        />
      </div>

      <!-- List view -->
      <div v-else class="space-y-1.5">
        <div
          v-for="media in items"
          :key="media.id"
          class="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <!-- Thumbnail -->
          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
            <img
              v-if="media.type === 'image'"
              :src="media.url"
              :alt="media.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <FileIcon class="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ media.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ media.human_size }} · {{ media.mime_type }}
            </p>
          </div>

          <Badge variant="outline" class="shrink-0 text-[11px]">{{
            media.type
          }}</Badge>

          <!-- Row actions -->
          <div
            class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              class="h-7 px-2 text-xs"
              @click="openPreview(media)"
            >
              <ExternalLinkIcon class="mr-1 h-3 w-3" />
              Preview
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              class="h-7 px-2 text-xs"
              @click="openEdit(media)"
            >
              Rename
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              class="h-7 px-2 text-xs text-destructive hover:text-destructive"
              @click="openDelete(media)"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-4 flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="isLoading"
          @click="loadMedia(false)"
        >
          <ChevronDownIcon class="mr-1.5 h-3.5 w-3.5" />
          Load more
        </Button>
      </div>
    </div>

    <!-- ── Rename Dialog ─────────────────────────────────────────────────────── -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename file</DialogTitle>
          <DialogDescription>
            Update the display name for this media file.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-2 py-2">
          <Label for="media-rename-input">Name</Label>
          <Input
            id="media-rename-input"
            v-model="editName"
            placeholder="Enter file name"
            @keydown.enter="submitEdit"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="editDialogOpen = false"
          >
            Cancel
          </Button>
          <Button
            type="button"
            :disabled="editSaving || !canSaveEdit"
            @click="submitEdit"
          >
            <span
              v-if="editSaving"
              class="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ── Delete Confirm ────────────────────────────────────────────────────── -->
    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete media?</AlertDialogTitle>
          <AlertDialogDescription>
            <span class="font-medium text-foreground">{{
              deletingMedia?.name
            }}</span>
            {{ " " }}will be permanently deleted from storage. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleteLoading"
            >Cancel</AlertDialogCancel
          >
          <AlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="deleteLoading"
            @click.prevent="confirmDelete"
          >
            <span
              v-if="deleteLoading"
              class="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- ── Preview Dialog ────────────────────────────────────────────────────── -->
    <Dialog v-model:open="previewDialogOpen">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle class="truncate">{{ previewMedia?.name }}</DialogTitle>
          <DialogDescription>
            {{ previewMedia?.human_size }} · {{ previewMedia?.mime_type }}
          </DialogDescription>
        </DialogHeader>

        <div class="overflow-hidden rounded-lg bg-muted/30">
          <img
            v-if="previewMedia?.type === 'image'"
            :src="previewMedia.url"
            :alt="previewMedia.name"
            class="mx-auto max-h-[70vh] w-auto object-contain"
          />
          <video
            v-else-if="previewMedia?.type === 'video'"
            :src="previewMedia.url"
            controls
            class="w-full"
          />
          <div
            v-else
            class="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground"
          >
            <FileIcon class="h-14 w-14 opacity-40" />
            <p class="text-sm">Preview not available for this file type</p>
            <Button
              type="button"
              as="a"
              :href="previewMedia?.url"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="outline"
            >
              Open file
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
