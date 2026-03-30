<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      @pointer-down-outside.prevent
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-border"
      >
        <div>
          <h2 class="text-sm font-semibold text-foreground">{{ title }}</h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            <template v-if="tag !== 'default'">
              Tag: <span class="font-medium text-foreground">{{ tag }}</span> ·
            </template>
            {{ multiple ? "Select one or more files" : "Select a file" }}
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-border">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors"
          :class="
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          "
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- ── Upload tab ────────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'upload'" class="p-5">
        <MediaUploadZone
          :queue="localQueue"
          :uploading="uploading"
          :show-actions="false"
          :multiple="multiple"
          :accept="filterAccept"
          hint="Upload directly to your library then attach here"
          @add="onFilesAdded"
          @remove="(id) => (localQueue = localQueue.filter((u) => u.id !== id))"
          @clear="localQueue = []"
        />
        <div
          v-if="pendingCount > 0"
          class="flex items-center justify-between mt-4 pt-4 border-t border-border"
        >
          <span class="text-xs text-muted-foreground"
            >{{ pendingCount }} file(s) ready</span
          >
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              @click="localQueue = []"
            >
              <X class="h-3 w-3" />Clear
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              :disabled="uploading"
              @click="doUpload"
            >
              <Loader2 v-if="uploading" class="h-3.5 w-3.5 animate-spin" />
              <UploadCloud v-else class="h-3.5 w-3.5" />
              {{ uploading ? "Uploading…" : "Upload & Use" }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Browse tab ────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'browse'">
        <!-- Toolbar -->
        <div
          class="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20"
        >
          <div class="relative flex-1">
            <Search
              class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            />
            <input
              v-model="browseSearch"
              type="text"
              placeholder="Search files…"
              class="w-full text-xs bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
              @input="debouncedBrowse"
            />
          </div>
          <div class="flex items-center gap-1">
            <button
              v-for="f in browseFilters"
              :key="f.value"
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              :class="
                browseType === f.value
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'border border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
              "
              @click="setBrowseType(f.value)"
            >
              <component :is="f.icon" class="h-3 w-3" />
              {{ f.label }}
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div class="overflow-y-auto" style="max-height: 400px">
          <div
            v-if="browseLoading && browseItems.length === 0"
            class="flex items-center justify-center py-14"
          >
            <Loader2 class="h-6 w-6 animate-spin text-primary" />
          </div>
          <div
            v-else-if="browseItems.length === 0"
            class="flex flex-col items-center gap-2 py-14 text-center"
          >
            <ImageIcon class="h-10 w-10 text-muted-foreground/30" />
            <p class="text-xs text-muted-foreground">No files found</p>
          </div>
          <div v-else class="grid grid-cols-4 gap-2.5 p-4">
            <div
              v-for="item in browseItems"
              :key="item.id"
              class="group relative rounded-xl border cursor-pointer overflow-hidden transition-all duration-150"
              :class="
                isBrowseSelected(item.id)
                  ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
              "
              @click="toggleBrowseSelect(item)"
            >
              <!-- Check indicator -->
              <div
                class="absolute top-1.5 left-1.5 z-10 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all"
                :class="
                  isBrowseSelected(item.id)
                    ? 'bg-primary border-primary'
                    : 'bg-background/80 border-border backdrop-blur-sm opacity-0 group-hover:opacity-100'
                "
              >
                <Check
                  v-if="isBrowseSelected(item.id)"
                  class="h-3 w-3 text-primary-foreground"
                />
              </div>

              <!-- Preview -->
              <div
                class="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="item.aggregate_type === 'image'"
                  :src="item.url"
                  :alt="item.alt ?? ''"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <video
                  v-else-if="item.aggregate_type === 'video'"
                  :src="item.url"
                  class="w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsinline
                />
                <component
                  v-else
                  :is="typeIconMap[item.aggregate_type] ?? File"
                  class="h-7 w-7 text-muted-foreground"
                />
              </div>

              <!-- Name -->
              <div class="px-2 py-1.5">
                <p
                  class="text-[10px] font-medium text-foreground truncate leading-tight"
                >
                  {{ item.original_filename ?? item.filename }}
                </p>
                <p class="text-[9px] text-muted-foreground">
                  {{ item.human_size }}
                </p>
              </div>
            </div>
          </div>

          <!-- Load more -->
          <div
            v-if="browseMeta.current_page < browseMeta.last_page"
            class="flex justify-center pb-4"
          >
            <button
              type="button"
              class="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              :disabled="browseLoading"
              @click="loadMoreBrowse"
            >
              <Loader2 v-if="browseLoading" class="h-3 w-3 animate-spin" />
              Load more
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20"
        >
          <p class="text-xs text-muted-foreground">
            {{ browseMeta.total }} file(s) in library
            <template v-if="browseSelected.length > 0">
              ·
              <span class="text-primary font-medium"
                >{{ browseSelected.length }} selected</span
              >
            </template>
          </p>
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-border px-4 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              :disabled="browseSelected.length === 0"
              @click="confirmBrowse"
            >
              <Paperclip class="h-3.5 w-3.5" />
              Use selected ({{ browseSelected.length }})
            </button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "@/lib/axios";
import {
  useMediaStore,
  type AggregateType,
  type Media,
  type MorphType,
  type UploadQueueItem,
} from "@/stores/media";
import {
  Check,
  File,
  FileAudio,
  FileText,
  FileVideo,
  FolderOpen,
  ImageIcon,
  Loader2,
  Paperclip,
  Search,
  UploadCloud,
  X,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import MediaUploadZone from "./MediaUploadZone.vue";

  // ── Props ─────────────────────────────────────────────────────────────────────

  const props = withDefaults(
    defineProps<{
      morphType: MorphType;
      morphId: number;
      tag?: string;
      filterType?: AggregateType;
      multiple?: boolean;
      title?: string;
    }>(),
    { tag: "default", multiple: false, title: "Select Media" },
  );

  const emit = defineEmits<{
    (e: "confirm", selected: Media[]): void;
  }>();

  // ── Expose show/close ─────────────────────────────────────────────────────────

  const open = ref(false);

  function show() {
    open.value = true;
    resetState();
  }
  function close() {
    open.value = false;
  }

  defineExpose({ show, close });

  // ── Store (upload only — browse uses direct axios to avoid clobbering items) ──

  const store = useMediaStore();
  const activeTab = ref<"upload" | "browse">("browse");

  const tabs = [
    { id: "browse" as const, label: "Browse Library", icon: FolderOpen },
    { id: "upload" as const, label: "Upload New", icon: UploadCloud },
  ];

  // ── Type icon map ─────────────────────────────────────────────────────────────

  const typeIconMap: Record<string, unknown> = {
    image: ImageIcon,
    video: FileVideo,
    audio: FileAudio,
    document: FileText,
    other: File,
  };

  // ── Upload tab ────────────────────────────────────────────────────────────────

  const localQueue = ref<UploadQueueItem[]>([]);
  const uploading = ref(false);
  const pendingCount = computed(
    () => localQueue.value.filter((u) => u.status === "pending").length,
  );

  function onFilesAdded(files: File[]) {
    for (const file of files) {
      localQueue.value.push({
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        progress: 0,
        status: "pending",
        tag: props.tag,
      });
    }
  }

  async function doUpload() {
    uploading.value = true;
    const uploaded: Media[] = [];
    for (const item of localQueue.value.filter((u) => u.status === "pending")) {
      item.status = "uploading";
      try {
        const result = await store.uploadMedia(item.file, item.alt, (p) => {
          item.progress = p;
        });
        item.status = "done";
        item.progress = 100;
        item.result = result;
        uploaded.push(result);
      } catch {
        item.status = "error";
        item.error = "Upload failed";
      }
    }
    uploading.value = false;
    if (uploaded.length) {
      emit("confirm", uploaded);
      close();
    }
  }

  // ── Browse tab — direct axios, never touches store.items ──────────────────────

  interface BrowseMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }

  const browseItems = ref<Media[]>([]);
  const browseMeta = ref<BrowseMeta>({
    current_page: 1,
    per_page: 24,
    total: 0,
    last_page: 1,
  });
  const browseLoading = ref(false);
  const browseSearch = ref("");
  const browseType = ref<AggregateType | "">(props.filterType ?? "");
  const browseSelected = ref<Media[]>([]);
  let browseDebounce: ReturnType<typeof setTimeout> | null = null;

  const browseFilters = (() => {
    const all = [
      { value: "" as AggregateType | "", label: "All", icon: File },
      { value: "image" as AggregateType, label: "Images", icon: ImageIcon },
      { value: "video" as AggregateType, label: "Video", icon: FileVideo },
      { value: "audio" as AggregateType, label: "Audio", icon: FileAudio },
      { value: "document" as AggregateType, label: "Docs", icon: FileText },
    ];
    return props.filterType
      ? all.filter((f) => f.value === "" || f.value === props.filterType)
      : all;
  })();

  const filterAccept = (() => {
    if (!props.filterType) return undefined;
    const map: Record<string, string[]> = {
      image: ["image/*"],
      video: ["video/*"],
      audio: ["audio/*"],
      document: [
        "application/pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".txt",
        ".csv",
      ],
    };
    return map[props.filterType];
  })();

  async function fetchBrowse(page = 1, append = false) {
    browseLoading.value = true;
    try {
      // Direct axios call — intentionally bypasses store.fetchMedia to prevent
      // overwriting store.items (which would break any open MediaLibrary list).
      const { data } = await axios.get<{ data: Media[]; meta: BrowseMeta }>(
        "/media",
        {
          params: {
            page,
            per_page: 24,
            search: browseSearch.value || undefined,
            aggregate_type: browseType.value || undefined,
            sort_by: "created_at",
            sort_order: "desc",
          },
        },
      );
      browseItems.value = append
        ? [...browseItems.value, ...data.data]
        : data.data;
      browseMeta.value = data.meta;
    } finally {
      browseLoading.value = false;
    }
  }

  function debouncedBrowse() {
    if (browseDebounce) clearTimeout(browseDebounce);
    browseDebounce = setTimeout(() => fetchBrowse(1), 300);
  }

  function setBrowseType(t: AggregateType | "") {
    browseType.value = t;
    fetchBrowse(1);
  }
  function loadMoreBrowse() {
    fetchBrowse(browseMeta.value.current_page + 1, true);
  }

  function isBrowseSelected(id: number) {
    return browseSelected.value.some((m) => m.id === id);
  }

  function toggleBrowseSelect(item: Media) {
    if (!props.multiple) {
      browseSelected.value = isBrowseSelected(item.id) ? [] : [item];
      return;
    }
    const idx = browseSelected.value.findIndex((m) => m.id === item.id);
    if (idx !== -1) browseSelected.value.splice(idx, 1);
    else browseSelected.value.push(item);
  }

  function confirmBrowse() {
    if (!browseSelected.value.length) return;
    emit("confirm", [...browseSelected.value]);
    close();
  }

  // ── Reset on open ─────────────────────────────────────────────────────────────

  function resetState() {
    activeTab.value = "browse";
    localQueue.value = [];
    browseSelected.value = [];
    browseSearch.value = "";
    browseType.value = props.filterType ?? "";
    fetchBrowse(1);
  }
</script>
