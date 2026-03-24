<script setup lang="ts">
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
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { Separator } from "@/components/ui/separator";
  import { Skeleton } from "@/components/ui/skeleton";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { notify } from "@/helpers/toast";
  import type { Media, MediaType } from "@/stores/media";
  import { useMediaStore } from "@/stores/media";
  import {
    CheckCircle2Icon,
    ImageIcon,
    SearchIcon,
    UploadIcon,
  } from "lucide-vue-next";
  import { storeToRefs } from "pinia";
  import { computed, ref, watch } from "vue";
  import MediaCard from "./MediaCard.vue";
  import MediaUploadZone from "./MediaUploadZone.vue";

  // ── Props / Emits ──────────────────────────────────────────────────────────────

  const props = defineProps<{
    projectId: number |any;
    multiple?: boolean;
    filterType?: MediaType;
    modelValue?: Media[];
  }>();

  const emit = defineEmits<{
    "update:modelValue": [selected: Media[]];
    confirm: [selected: Media[]];
  }>();

  // ── Store ──────────────────────────────────────────────────────────────────────

  const mediaStore = useMediaStore();
  const { items, isLoading, meta } = storeToRefs(mediaStore);

  // ── Local State ────────────────────────────────────────────────────────────────

  const open = ref(false);
  const activeTab = ref<"browse" | "upload">("browse");
  const searchQuery = ref("");
  const selectedIds = ref<Set<number>>(new Set());
  const uploadZoneRef = ref<InstanceType<typeof MediaUploadZone> | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────────

  const filteredItems = computed(() => {
    let list = items.value;
    if (props.filterType) {
      list = list.filter((m) => m.type === props.filterType);
    }
    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return list;
  });

  const selectedItems = computed<Media[]>(() =>
    items.value.filter((m) => selectedIds.value.has(m.id)),
  );

  const selectionLabel = computed(() => {
    const n = selectedIds.value.size;
    return n ? `${n} selected` : "No files selected";
  });

  const hasMore = computed(
    () => meta.value.current_page < meta.value.last_page,
  );

  // ── Pre-select from v-model ────────────────────────────────────────────────────

  watch(
    () => props.modelValue,
    (val) => {
      if (val?.length) {
        selectedIds.value = new Set(val.map((m) => m.id));
      }
    },
    { immediate: true },
  );

  // ── Visibility ─────────────────────────────────────────────────────────────────

  function show(): void {
    open.value = true;
    void loadMedia();
  }

  function hide(): void {
    open.value = false;
  }

  defineExpose({ show, hide });

  // ── Load ───────────────────────────────────────────────────────────────────────

  async function loadMedia(): Promise<void> {
    await mediaStore.fetchMedia(props.projectId, {
      page: 1,
      type: props.filterType ?? undefined,
    });
  }

  async function loadMore(): Promise<void> {
    await mediaStore.loadMoreMedia(props.projectId, {
      page: meta.value.current_page + 1,
      type: props.filterType ?? undefined,
    });
  }

  // ── Selection ──────────────────────────────────────────────────────────────────

  function toggleSelect(media: Media): void {
    if (selectedIds.value.has(media.id)) {
      selectedIds.value = new Set(
        [...selectedIds.value].filter((id) => id !== media.id),
      );
    } else {
      if (!props.multiple) {
        selectedIds.value = new Set([media.id]);
      } else {
        selectedIds.value = new Set([...selectedIds.value, media.id]);
      }
    }
  }

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
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        uploadZoneRef.value?.markError(queueItem.id, msg);
        notify.error("Upload failed", msg);
      }
    }

    setTimeout(() => {
      activeTab.value = "browse";
      uploadZoneRef.value?.clearQueue();
    }, 1000);
  }

  // ── Confirm ────────────────────────────────────────────────────────────────────

  function confirmSelection(): void {
    const selected = selectedItems.value;
    emit("update:modelValue", selected);
    emit("confirm", selected);
    open.value = false;
  }
</script>

<template>
  <!-- Trigger slot -->
  <slot :show="show" />

  <Dialog v-model:open="open">
    <DialogContent class="flex max-h-[90vh] flex-col sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Media Library</DialogTitle>
        <DialogDescription>
          {{
            multiple
              ? "Select one or more files to attach."
              : "Select a file to attach."
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="flex min-h-0 flex-1 flex-col gap-3">
        <div class="flex items-center justify-between gap-3">
          <TabsList class="h-8">
            <TabsTrigger value="browse" class="text-xs">Browse</TabsTrigger>
            <TabsTrigger value="upload" class="text-xs">
              <UploadIcon class="mr-1.5 h-3 w-3" />
              Upload new
            </TabsTrigger>
          </TabsList>

          <!-- Search -->
          <div v-if="activeTab === 'browse'" class="relative w-48">
            <SearchIcon
              class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search files…"
              class="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <!-- Browse -->
        <TabsContent value="browse" class="mt-0 min-h-0 flex-1">
          <ScrollArea class="h-[420px] pr-1">
            <!-- Loading -->
            <div
              v-if="isLoading && !filteredItems.length"
              class="grid grid-cols-3 gap-3 sm:grid-cols-4"
            >
              <Skeleton
                v-for="n in 8"
                :key="n"
                class="aspect-square rounded-lg"
              />
            </div>

            <!-- Empty -->
            <div
              v-else-if="!filteredItems.length"
              class="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground"
            >
              <ImageIcon class="h-10 w-10 opacity-40" />
              <p class="text-sm">
                {{
                  searchQuery ? "No files match your search" : "No files yet"
                }}
              </p>
              <Button
                v-if="!searchQuery"
                type="button"
                size="sm"
                variant="outline"
                @click="activeTab = 'upload'"
              >
                Upload a file
              </Button>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-3 gap-3 sm:grid-cols-4">
              <MediaCard
                v-for="media in filteredItems"
                :key="media.id"
                :media="media"
                :selectable="true"
                :selected="selectedIds.has(media.id)"
                compact
                @select="toggleSelect"
              />
            </div>

            <!-- Load more -->
            <div v-if="hasMore" class="mt-4 flex justify-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                :disabled="isLoading"
                @click="loadMore"
              >
                Load more
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <!-- Upload -->
        <TabsContent value="upload" class="mt-0">
          <MediaUploadZone ref="uploadZoneRef" @upload="handleUploadFiles" />
        </TabsContent>
      </Tabs>

      <Separator />

      <DialogFooter class="items-center gap-3 pt-2">
        <div class="mr-auto flex items-center gap-2">
          <CheckCircle2Icon
            v-if="selectedIds.size > 0"
            class="h-4 w-4 text-primary"
          />
          <span class="text-sm text-muted-foreground">{{
            selectionLabel
          }}</span>
          <Badge
            v-if="selectedIds.size > 0"
            variant="secondary"
            class="h-5 text-xs"
          >
            {{ selectedIds.size }}
          </Badge>
        </div>

        <Button type="button" variant="outline" @click="hide">Cancel</Button>
        <Button
          type="button"
          :disabled="selectedIds.size === 0"
          @click="confirmSelection"
        >
          Attach{{ selectedIds.size ? ` (${selectedIds.size})` : "" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
