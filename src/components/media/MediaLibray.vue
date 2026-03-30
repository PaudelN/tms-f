<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- ── Toolbar ─────────────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-2.5 mb-5">
      <!-- Type stat chips -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <button
          v-for="stat in typeStats"
          :key="stat.type"
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all"
          :class="
            activeType === stat.type
              ? 'border-primary/40 bg-primary/8 text-primary shadow-sm'
              : 'border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
          "
          @click="toggleTypeFilter(stat.type)"
        >
          <component :is="stat.icon" class="h-3 w-3" />
          {{ stat.label }}
          <span
            class="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full text-[9px] font-bold px-1"
            :class="
              activeType === stat.type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            "
            >{{ stat.count }}</span
          >
        </button>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <!-- Search -->
        <div class="relative">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search files…"
            class="text-xs bg-background border border-border rounded-xl pl-8 pr-8 py-1.5 w-52 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
            @input="debouncedFetch"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            @click="clearSearch"
          >
            <X class="h-3 w-3" />
          </button>
        </div>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="text-xs bg-background border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary/50 transition-colors"
          @change="fetchPage(1)"
        >
          <option value="created_at">Date uploaded</option>
          <option value="size">File size</option>
          <option value="original_filename">Name</option>
        </select>

        <button
          type="button"
          class="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          :title="sortOrder === 'desc' ? 'Newest first' : 'Oldest first'"
          @click="toggleSort"
        >
          <ArrowDownUp class="h-3.5 w-3.5" />
        </button>

        <!-- View toggle -->
        <div
          class="flex items-center border border-border rounded-xl overflow-hidden"
        >
          <button
            type="button"
            class="h-8 w-8 flex items-center justify-center transition-colors"
            :class="
              view === 'grid'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent'
            "
            @click="view = 'grid'"
          >
            <LayoutGrid class="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            class="h-8 w-8 flex items-center justify-center transition-colors"
            :class="
              view === 'list'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent'
            "
            @click="view = 'list'"
          >
            <List class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- Bulk delete -->
        <Transition name="slide-right">
          <div v-if="selected.length > 0" class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground"
              >{{ selected.length }} selected</span
            >
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              @click="selected = []"
            >
              <X class="h-3 w-3" />Clear
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              @click="bulkDeleteConfirmOpen = true"
            >
              <Trash2 class="h-3 w-3" />
              Delete ({{ selected.length }})
            </button>
          </div>
        </Transition>

        <!-- Upload -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          @click="uploadPanelOpen = !uploadPanelOpen"
        >
          <UploadCloud class="h-3.5 w-3.5" />
          Upload
        </button>
      </div>
    </div>

    <!-- ── Upload panel ────────────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="uploadPanelOpen"
        class="mb-4 rounded-xl border border-dashed border-primary/30 p-4 bg-primary/[0.02]"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-semibold text-foreground">Upload to Library</p>
          <button
            type="button"
            class="text-muted-foreground hover:text-foreground transition-colors"
            @click="uploadPanelOpen = false"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
        <MediaUploadZone
          :queue="store.uploadQueue"
          :uploading="uploading"
          :show-actions="true"
          :multiple="true"
          @add="onFilesAdded"
          @remove="store.removeFromQueue"
          @upload="doUpload"
          @clear="store.clearQueue"
        />
      </div>
    </Transition>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <!-- Fetch error state -->
      <div
        v-if="fetchError"
        class="flex flex-col items-center gap-3 py-16 text-center"
      >
        <p class="text-sm font-semibold text-destructive">
          Failed to load media
        </p>
        <p class="text-xs text-muted-foreground">{{ fetchError }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-accent transition-colors"
          @click="fetchPage(1)"
        >
          Retry
        </button>
      </div>

      <!-- Loading skeletons -->
      <div
        v-else-if="loading && items.length === 0"
        class="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <div
          v-for="i in 10"
          :key="i"
          class="rounded-xl bg-muted/50 animate-pulse aspect-[4/3]"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="items.length === 0"
        class="flex flex-col items-center gap-3 py-20 text-center"
      >
        <div
          class="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center"
        >
          <ImageIcon class="h-7 w-7 text-muted-foreground/40" />
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground">No files found</p>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{
              searchQuery || activeType
                ? "Try adjusting your filters"
                : "Upload your first file to get started"
            }}
          </p>
        </div>
        <button
          v-if="!searchQuery && !activeType"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          @click="uploadPanelOpen = true"
        >
          <UploadCloud class="h-3.5 w-3.5" />Upload files
        </button>
      </div>

      <!-- Grid view -->
      <div
        v-else-if="view === 'grid'"
        class="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <MediaCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :selected="isSelected(item.id)"
          @click="onCardClick(item)"
          @select="toggleSelect"
          @edit="openEdit"
          @delete="promptDelete"
        />
      </div>

      <!-- List view -->
      <div v-else class="space-y-1">
        <div
          v-for="item in items"
          :key="item.id"
          class="group flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 cursor-pointer transition-all"
          :class="isSelected(item.id) ? 'border-primary/40 bg-primary/5' : ''"
          @click="onCardClick(item)"
        >
          <!-- Checkbox -->
          <div
            class="h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
            :class="
              isSelected(item.id)
                ? 'bg-primary border-primary'
                : 'border-border opacity-0 group-hover:opacity-100'
            "
            @click.stop="toggleSelect(item)"
          >
            <Check
              v-if="isSelected(item.id)"
              class="h-3 w-3 text-primary-foreground"
            />
          </div>

          <!-- Thumbnail -->
          <div
            class="h-10 w-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
            :class="
              item.aggregate_type !== 'image'
                ? typeStyle(item.aggregate_type).bg
                : 'bg-muted'
            "
          >
            <img
              v-if="item.aggregate_type === 'image'"
              :src="item.url"
              :alt="item.alt ?? ''"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <component
              v-else
              :is="typeIcon(item.aggregate_type)"
              class="h-5 w-5"
              :class="typeStyle(item.aggregate_type).icon"
            />
          </div>

          <!-- Name + meta -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">
              {{ item.original_filename ?? item.filename }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ item.human_size }} · {{ item.mime_type }} ·
              {{ formatDate(item.created_at) }}
            </p>
          </div>

          <!-- Uploader -->
          <span class="text-xs text-muted-foreground shrink-0 hidden md:block">
            {{ item.uploader?.name ?? "—" }}
          </span>

          <!-- Row actions -->
          <div
            class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            @click.stop
          >
            <button
              type="button"
              class="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              @click="openEdit(item)"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              @click="promptDelete(item)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="meta.last_page > 1"
        class="flex items-center justify-between pt-4 mt-4 border-t border-border"
      >
        <p class="text-xs text-muted-foreground">
          Showing {{ (meta.current_page - 1) * meta.per_page + 1 }}–{{
            Math.min(meta.current_page * meta.per_page, meta.total)
          }}
          of {{ meta.total.toLocaleString() }}
        </p>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-xs hover:bg-accent transition-colors disabled:opacity-40"
            :disabled="meta.current_page <= 1"
            @click="fetchPage(meta.current_page - 1)"
          >
            <ChevronLeft class="h-3.5 w-3.5" />
          </button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            type="button"
            class="h-8 min-w-[32px] px-2 rounded-lg border text-xs font-medium transition-colors"
            :class="
              page === meta.current_page
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border hover:bg-accent'
            "
            @click="fetchPage(page)"
          >
            {{ page }}
          </button>
          <button
            type="button"
            class="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-xs hover:bg-accent transition-colors disabled:opacity-40"
            :disabled="meta.current_page >= meta.last_page"
            @click="fetchPage(meta.current_page + 1)"
          >
            <ChevronRight class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Detail / edit modal ─────────────────────────────────────────── -->
    <MediaDetailModal
      :item="previewItem"
      @close="previewItem = null"
      @save="onSaveAlt"
      @delete="promptDelete"
    />

    <!-- ── Single delete confirm ───────────────────────────────────────── -->
    <Dialog v-model:open="deleteConfirmOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Permanently delete
            <strong class="text-destructive">{{
              itemToDelete?.original_filename
            }}</strong
            >? This removes the file from all attached models and cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="deleteConfirmOpen = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            :disabled="deleting"
            class="gap-1.5"
            @click="doDelete"
          >
            <Loader2 v-if="deleting" class="h-3.5 w-3.5 animate-spin" />
            {{ deleting ? "Deleting…" : "Delete" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ── Bulk delete confirm ─────────────────────────────────────────── -->
    <Dialog v-model:open="bulkDeleteConfirmOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {{ selected.length }} Files</DialogTitle>
          <DialogDescription>
            Permanently delete the selected {{ selected.length }} files? This
            cannot be undone and will remove them from all attached models.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2">
          <Button variant="outline" @click="bulkDeleteConfirmOpen = false"
            >Cancel</Button
          >
          <Button
            variant="destructive"
            :disabled="deleting"
            class="gap-1.5"
            @click="doBulkDelete"
          >
            <Loader2 v-if="deleting" class="h-3.5 w-3.5 animate-spin" />
            {{ deleting ? "Deleting…" : `Delete (${selected.length})` }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import {
    ArrowDownUp,
    Check,
    ChevronLeft,
    ChevronRight,
    File,
    FileAudio,
    FileText,
    FileVideo,
    ImageIcon,
    LayoutGrid,
    List,
    Loader2,
    Pencil,
    Search,
    Trash2,
    UploadCloud,
    X,
  } from "lucide-vue-next";
  import { computed, onMounted, ref } from "vue";

  import Button from "@/components/ui/button/Button.vue";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { notify } from "@/helpers/toast";
  import axios from "@/lib/axios";
  import {
    useMediaStore,
    type AggregateType,
    type Media,
  } from "@/stores/media";

  import MediaCard from "./MediaCard.vue";
  import MediaDetailModal from "./MediaDetailModal.vue";
  import MediaUploadZone from "./MediaUploadZone.vue";

  // ── Props / emits ─────────────────────────────────────────────────────────────

  withDefaults(
    defineProps<{
      /** true  → clicking a card opens MediaDetailModal inline (global library)
       *  false → fires @view so the parent can navigate to a detail route     */
      hardDelete?: boolean;
    }>(),
    { hardDelete: false },
  );

  const emit = defineEmits<{
    (e: "view", item: Media): void;
  }>();

  // ── Store ─────────────────────────────────────────────────────────────────────

  const store = useMediaStore();

  // ── Local state ───────────────────────────────────────────────────────────────

  const items = ref<Media[]>([]);
  const meta = ref({ current_page: 1, per_page: 20, total: 0, last_page: 1 });
  const loading = ref(false);
  const uploading = ref(false);
  const fetchError = ref<string | null>(null);

  const searchQuery = ref("");
  const activeType = ref<AggregateType | "">("");
  const sortBy = ref<"created_at" | "size" | "original_filename">("created_at");
  const sortOrder = ref<"asc" | "desc">("desc");
  const view = ref<"grid" | "list">("grid");

  const selected = ref<Media[]>([]);
  const previewItem = ref<Media | null>(null);
  const uploadPanelOpen = ref(false);
  const deleteConfirmOpen = ref(false);
  const deleting = ref(false);
  const itemToDelete = ref<Media | null>(null);
  const bulkDeleteConfirmOpen = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Type counts ───────────────────────────────────────────────────────────────
  // One request to /media/counts instead of 5 parallel per-type requests.

  const typeCounts = ref<Record<string, number>>({});

  /**
   * Hits a single lightweight endpoint that returns counts keyed by
   * aggregate_type, e.g. { image: 12, video: 3, audio: 0, document: 7, other: 2 }.
   *
   * If your backend doesn't have this endpoint yet, replace the axios call with
   * the fallback below — it fires 5 requests in parallel using store.countMedia()
   * (the previous behaviour), but at least they're all awaited together:
   *
   *   const types: AggregateType[] = ["image","video","audio","document","other"];
   *   const results = await Promise.allSettled(types.map(t => store.countMedia(t)));
   *   results.forEach((r, i) => {
   *     if (r.status === "fulfilled") typeCounts.value[types[i]] = r.value;
   *   });
   */
  async function fetchTypeCounts(): Promise<void> {
    try {
      const { data } =
        await axios.get<Record<AggregateType, number>>("/media/counts");
      typeCounts.value = data;
    } catch {
      // Non-critical — chips will just show 0 if this fails
    }
  }

  const AGGREGATE_TYPES: {
    type: AggregateType;
    label: string;
    icon: unknown;
  }[] = [
    { type: "image", label: "Images", icon: ImageIcon },
    { type: "video", label: "Video", icon: FileVideo },
    { type: "audio", label: "Audio", icon: FileAudio },
    { type: "document", label: "Docs", icon: FileText },
    { type: "other", label: "Other", icon: File },
  ];

  const typeStats = computed(() =>
    AGGREGATE_TYPES.map((t) => ({
      ...t,
      count: typeCounts.value[t.type] ?? 0,
    })),
  );

  // ── Pagination ────────────────────────────────────────────────────────────────

  const pageNumbers = computed(() => {
    const total = meta.value.last_page;
    const cur = meta.value.current_page;
    const pages: number[] = [];
    for (let p = Math.max(1, cur - 2); p <= Math.min(total, cur + 2); p++)
      pages.push(p);
    return pages;
  });

  // ── Type styling ──────────────────────────────────────────────────────────────

  const typeStyleMap: Record<string, { bg: string; icon: string }> = {
    image: { bg: "bg-violet-500/10", icon: "text-violet-500" },
    video: { bg: "bg-rose-500/10", icon: "text-rose-500" },
    audio: { bg: "bg-amber-500/10", icon: "text-amber-500" },
    document: { bg: "bg-sky-500/10", icon: "text-sky-500" },
    other: { bg: "bg-slate-500/10", icon: "text-slate-500" },
  };

  const typeIconMap: Record<string, unknown> = {
    image: ImageIcon,
    video: FileVideo,
    audio: FileAudio,
    document: FileText,
    other: File,
  };

  function typeStyle(t: string) {
    return typeStyleMap[t] ?? typeStyleMap.other;
  }
  function typeIcon(t: string) {
    return typeIconMap[t] ?? File;
  }

  // ── Data ──────────────────────────────────────────────────────────────────────

  async function fetchPage(page = 1): Promise<void> {
    loading.value = true;
    fetchError.value = null;
    try {
      const result = await store.fetchMedia({
        page,
        perPage: 20,
        search: searchQuery.value || undefined,
        aggregate_type: activeType.value || undefined,
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
      });
      items.value = result.data;
      meta.value = result.meta;

      // Refresh counts only on unfiltered first-page load (one extra request
      // instead of the previous 5)
      if (page === 1 && !searchQuery.value && !activeType.value) {
        fetchTypeCounts();
      }
    } catch (err: any) {
      fetchError.value = err?.message ?? "Could not load media library.";
      notify.error("Load failed", fetchError.value!);
    } finally {
      loading.value = false;
    }
  }

  function debouncedFetch(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchPage(1), 350);
  }

  function clearSearch(): void {
    searchQuery.value = "";
    fetchPage(1);
  }

  function toggleTypeFilter(type: AggregateType): void {
    activeType.value = activeType.value === type ? "" : type;
    fetchPage(1);
  }

  function toggleSort(): void {
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
    fetchPage(1);
  }

  // ── Card interactions ─────────────────────────────────────────────────────────

  function onCardClick(item: Media): void {
    // hardDelete=true  → open inline modal
    // hardDelete=false → let parent navigate
    previewItem.value = item;
    emit("view", item);
  }

  // ── Selection ─────────────────────────────────────────────────────────────────

  function isSelected(id: number): boolean {
    return selected.value.some((m) => m.id === id);
  }

  function toggleSelect(item: Media): void {
    const idx = selected.value.findIndex((m) => m.id === item.id);
    if (idx !== -1) selected.value.splice(idx, 1);
    else selected.value.push(item);
  }

  // ── Upload ────────────────────────────────────────────────────────────────────

  function onFilesAdded(files: File[]): void {
    store.enqueue(files);
  }

  async function doUpload(): Promise<void> {
    uploading.value = true;
    try {
      const uploaded = await store.flushQueue();
      store.clearCompletedQueue();
      uploadPanelOpen.value = false;
      await fetchPage(1);
      notify.success(
        "Uploaded",
        `${uploaded.length} file(s) added to library.`,
      );
    } catch {
      notify.error("Upload failed", "Some files could not be uploaded.");
    } finally {
      uploading.value = false;
    }
  }

  // ── Edit / alt-text ───────────────────────────────────────────────────────────

  function openEdit(item: Media): void {
    previewItem.value = item;
  }

  async function onSaveAlt(id: number, alt: string | null): Promise<void> {
    try {
      const updated = await store.updateMedia(id, alt);
      const idx = items.value.findIndex((m) => m.id === id);
      if (idx !== -1) items.value[idx] = updated;
      previewItem.value = null;
      notify.success("Saved", "Alt text updated.");
    } catch {
      notify.error("Save failed", "Could not update alt text.");
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  function promptDelete(item: Media): void {
    previewItem.value = null;
    itemToDelete.value = item;
    deleteConfirmOpen.value = true;
  }

  async function doDelete(): Promise<void> {
    if (!itemToDelete.value) return;
    deleting.value = true;
    try {
      await store.deleteMedia(itemToDelete.value.id);
      items.value = items.value.filter((m) => m.id !== itemToDelete.value!.id);
      meta.value.total = Math.max(0, meta.value.total - 1);
      deleteConfirmOpen.value = false;
      itemToDelete.value = null;
      notify.success("Deleted", "File permanently deleted.");
    } catch {
      notify.error("Delete failed", "Could not delete the file.");
    } finally {
      deleting.value = false;
    }
  }

  async function doBulkDelete(): Promise<void> {
    deleting.value = true;
    const ids = selected.value.map((m) => m.id);
    let count = 0;
    for (const id of ids) {
      try {
        await store.deleteMedia(id);
        count++;
      } catch {
        /* continue */
      }
    }
    items.value = items.value.filter((m) => !ids.includes(m.id));
    meta.value.total = Math.max(0, meta.value.total - count);
    selected.value = [];
    bulkDeleteConfirmOpen.value = false;
    deleting.value = false;
    notify.success("Deleted", `${count} file(s) permanently deleted.`);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function formatDate(d: string): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  onMounted(() => fetchPage(1));
</script>

<style scoped>
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    max-height: 0;
  }
  .slide-down-enter-to,
  .slide-down-leave-from {
    max-height: 600px;
    opacity: 1;
  }

  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.15s ease;
  }
  .slide-right-enter-from,
  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(8px);
  }
</style>
