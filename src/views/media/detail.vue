<template>
  <UiDetail
    :loading="pageLoading"
    loading-text="Loading media…"
    :breadcrumbs="breadcrumbs"
    :status-badge="typeBadge"
    :actions="actions"
    :meta-fields="metaFields"
    :meta-default-size="22"
    :tabs="detailTabs"
    :delete-open="deleteModalOpen"
    :delete-loading="deleteLoading"
    :delete-dialog="deleteDialog"
    @update:delete-open="deleteModalOpen = $event"
    @confirm-delete="confirmDelete"
  >
    <template #content>
      <!-- ── Preview ──────────────────────────────────────────────────────── -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <EyeIcon class="h-3.5 w-3.5 text-muted-foreground/50" />
          <h2
            class="text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none"
          >
            Preview
          </h2>
        </div>

        <!-- Image preview -->
        <div
          v-if="media?.aggregate_type === 'image'"
          class="group relative overflow-hidden rounded-lg border border-border/40 bg-muted/10"
        >
          <img
            :src="media.url"
            :alt="media.alt ?? displayName"
            class="w-full object-contain max-h-72 transition-transform duration-500 group-hover:scale-[1.01]"
            loading="lazy"
          />
        </div>

        <!-- Video preview -->
        <div
          v-else-if="media?.aggregate_type === 'video'"
          class="rounded-lg border border-border/40 overflow-hidden bg-black"
        >
          <video :src="media.url" controls class="w-full max-h-72" />
        </div>

        <!-- Audio preview -->
        <div
          v-else-if="media?.aggregate_type === 'audio'"
          class="rounded-lg border border-border/40 bg-muted/10 p-4"
        >
          <audio :src="media!.url" controls class="w-full" />
        </div>

        <!-- PDF embed -->
        <div
          v-else-if="media?.mime_type === 'application/pdf'"
          class="rounded-lg border border-border/40 overflow-hidden"
        >
          <iframe
            :src="media.url"
            class="w-full"
            style="height: 320px; border: none"
            :title="displayName"
          />
        </div>

        <!-- Generic file icon -->
        <div
          v-else-if="media"
          class="rounded-lg border border-dashed border-border/60 bg-muted/10 h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          <FileIcon class="h-9 w-9 opacity-20" />
          <p class="text-[11px] font-medium opacity-50 uppercase tracking-wide">
            {{ media.extension }} · No preview available
          </p>
        </div>

        <!-- Skeleton -->
        <div v-else class="h-32 w-full animate-pulse rounded-lg bg-muted/40" />
      </div>

      <!-- ── Alt text ──────────────────────────────────────────────────────── -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <AlignLeft class="h-3.5 w-3.5 text-muted-foreground/50" />
          <h2
            class="text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none"
          >
            Alt Text
          </h2>
        </div>

        <!-- Editing state -->
        <div v-if="editingAlt" class="flex items-start gap-2">
          <Input
            v-model="altDraft"
            placeholder="Describe this file for accessibility…"
            class="flex-1 h-8 text-[12.5px]"
            @keydown.enter="saveAlt"
            @keydown.escape="cancelAltEdit"
          />
          <Button
            size="sm"
            class="h-8 text-[12px] shrink-0"
            :disabled="savingAlt"
            @click="saveAlt"
          >
            <Loader2Icon
              v-if="savingAlt"
              class="h-3.5 w-3.5 animate-spin mr-1"
            />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="h-8 text-[12px] shrink-0"
            @click="cancelAltEdit"
          >
            Cancel
          </Button>
        </div>

        <!-- Display state -->
        <div
          v-else-if="media?.alt"
          class="text-[13px] text-foreground/80 leading-relaxed rounded-lg bg-muted/15 border border-border/40 px-4 py-3 cursor-pointer hover:bg-muted/25 transition-colors"
          @click="startAltEdit"
        >
          {{ media.alt }}
        </div>
        <div
          v-else-if="media"
          class="text-[12px] text-muted-foreground/50 italic rounded-lg bg-muted/8 border border-dashed border-border/40 px-4 py-3 cursor-pointer hover:bg-muted/15 hover:text-muted-foreground/70 transition-all duration-200"
          @click="startAltEdit"
        >
          No alt text yet — click to add one.
        </div>
      </div>

      <!-- ── URL copy ──────────────────────────────────────────────────────── -->
      <div v-if="media" class="space-y-2.5">
        <div class="flex items-center gap-2">
          <LinkIcon class="h-3.5 w-3.5 text-muted-foreground/50" />
          <h2
            class="text-[11px] font-semibold tracking-[0.07em] uppercase text-muted-foreground/60 select-none"
          >
            File URL
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <Input
            :value="media.url"
            readonly
            class="flex-1 h-8 text-[11.5px] text-muted-foreground bg-muted/40 font-mono"
          />
          <Button
            variant="outline"
            size="sm"
            class="h-8 shrink-0 gap-1.5 text-[12px]"
            @click="copyUrl"
          >
            <CopyIcon class="h-3.5 w-3.5" />
            {{ copied ? "Copied!" : "Copy" }}
          </Button>
        </div>
      </div>
    </template>

    <template #delete-body>
      <span>
        <strong class="font-semibold">{{ displayName }}</strong> will be
        permanently deleted from storage. Any model that references this file
        will lose the attachment. This cannot be undone.
      </span>
    </template>
  </UiDetail>
</template>

<script setup lang="ts">
  import type {
    ActionButton,
    BreadcrumbItem,
    MetaField,
    TabItem,
  } from "@/components/common/UiDetail.vue";
  import UiDetail from "@/components/common/UiDetail.vue";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { notify } from "@/helpers/toast";
  import { humanSize, mediaDisplayName, useMediaStore } from "@/stores/media";
  import {
    AlignLeft,
    CalendarDays,
    CopyIcon,
    DownloadIcon,
    EyeIcon,
    FileIcon,
    HardDriveIcon,
    LinkIcon,
    Loader2Icon,
    PencilIcon,
    RefreshCcwIcon,
    Trash2,
    TypeIcon,
  } from "lucide-vue-next";
  import { computed, onMounted, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";

  // ── Router / Store ─────────────────────────────────────────────────────────
  const route = useRoute();
  const router = useRouter();
  const mediaStore = useMediaStore();

  // ── Route param ────────────────────────────────────────────────────────────
  const mediaId = computed<number | null>(() => {
    const id = Number(route.params.id);
    return !isNaN(id) && id > 0 ? id : null;
  });

  // ── Page state ─────────────────────────────────────────────────────────────
  const pageLoading = ref(false);
  const deleteModalOpen = ref(false);
  const deleteLoading = ref(false);

  // ── Local media record (isolated from store.items) ─────────────────────────
  // We use currentMedia from the store (written by fetchOne) but alias it
  // locally so the template stays clean.
  const media = computed(() => mediaStore.currentMedia);

  const displayName = computed(() =>
    media.value ? mediaDisplayName(media.value) : "Media",
  );

  // ── Alt text editing ───────────────────────────────────────────────────────
  const editingAlt = ref(false);
  const altDraft = ref("");
  const savingAlt = ref(false);

  function startAltEdit(): void {
    altDraft.value = media.value?.alt ?? "";
    editingAlt.value = true;
  }

  function cancelAltEdit(): void {
    editingAlt.value = false;
    altDraft.value = "";
  }

  async function saveAlt(): Promise<void> {
    if (!mediaId.value || savingAlt.value) return;
    savingAlt.value = true;
    try {
      await mediaStore.updateMedia(mediaId.value, {
        alt: altDraft.value.trim() || null,
      });
      editingAlt.value = false;
      notify.success("Alt text saved");
    } catch {
      notify.error("Error", "Could not save alt text.");
    } finally {
      savingAlt.value = false;
    }
  }

  // ── URL copy ───────────────────────────────────────────────────────────────
  const copied = ref(false);
  async function copyUrl(): Promise<void> {
    if (!media.value?.url) return;
    await navigator.clipboard.writeText(media.value.url).catch(() => {});
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }

  // ── Download ───────────────────────────────────────────────────────────────
  function download(): void {
    if (!media.value) return;
    const a = document.createElement("a");
    a.href = media.value.url;
    a.download = displayName.value;
    a.click();
  }

  // ── Type badge (mirrors statusBadge in project detail) ────────────────────
  const TYPE_CONFIG: Record<
    string,
    { label: string; dot: string; badge: string }
  > = {
    image: {
      label: "Image",
      dot: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    video: {
      label: "Video",
      dot: "bg-purple-500",
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    },
    audio: {
      label: "Audio",
      dot: "bg-green-500",
      badge:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
    document: {
      label: "Document",
      dot: "bg-amber-500",
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    other: {
      label: "Other",
      dot: "bg-slate-400",
      badge: "bg-muted text-muted-foreground",
    },
  };

  const typeBadge = computed(() => {
    if (!media.value) return undefined;
    const cfg = TYPE_CONFIG[media.value.aggregate_type] ?? TYPE_CONFIG.other;
    return { label: cfg.label, dot: cfg.dot, class: cfg.badge };
  });

  // ── Breadcrumbs ────────────────────────────────────────────────────────────
  const breadcrumbs = computed<BreadcrumbItem[]>(() => [
    {
      label: "Media Library",
      onClick: () => router.push({ name: "media-index" }),
    },
    { label: displayName.value },
  ]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const actions = computed<ActionButton[]>(() => [
    {
      id: "refresh",
      label: "Refresh",
      icon: RefreshCcwIcon,
      onClick: loadMedia,
    },
    {
      id: "edit-alt",
      label: "Edit Alt",
      icon: PencilIcon,
      onClick: startAltEdit,
    },
    {
      id: "download",
      label: "Download",
      icon: DownloadIcon,
      onClick: download,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: () => {
        deleteModalOpen.value = true;
      },
    },
  ]);

  // ── Meta fields ────────────────────────────────────────────────────────────
  function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const metaFields = computed<MetaField[]>(() => [
    // Uploader shown as avatar, matching the "Creator" pattern in project detail
    {
      label: "Uploaded By",
      type: "avatar" as const,
      avatarData: media.value?.uploaded_by
        ? {
            initials: media.value.uploaded_by.name.charAt(0).toUpperCase(),
            name: media.value.uploaded_by.name,
          }
        : undefined,
    },
    {
      label: "File Size",
      icon: HardDriveIcon,
      value: media.value ? humanSize(media.value.size) : "—",
    },
    {
      label: "MIME Type",
      icon: TypeIcon,
      value: media.value?.mime_type ?? "—",
    },
    {
      label: "Extension",
      icon: FileIcon,
      value: media.value ? `.${media.value.extension}` : "—",
    },
    {
      label: "Disk",
      icon: HardDriveIcon,
      value: media.value?.disk ?? "—",
    },
    {
      label: "Uploaded",
      icon: CalendarDays,
      value: formatDate(media.value?.created_at),
    },
    {
      label: "Last Updated",
      icon: CalendarDays,
      value: formatDate(media.value?.updated_at),
    },
  ]);

  // ── Tabs — media has no sub-entities, kept minimal ────────────────────────
  const detailTabs = computed<TabItem[]>(() => []);

  // ── Delete dialog ──────────────────────────────────────────────────────────
  const deleteDialog = {
    title: "Delete File",
    description: "This action cannot be undone.",
    confirmLabel: "Delete File",
  };

  // ── Data loading ───────────────────────────────────────────────────────────
  async function loadMedia(): Promise<void> {
    if (!mediaId.value) {
      router.push({ name: "media-index" });
      return;
    }
    pageLoading.value = true;
    try {
      await mediaStore.fetchOne(mediaId.value);
    } catch {
      notify.error("Not found", "This media file could not be loaded.");
      router.push({ name: "media-index" });
    } finally {
      pageLoading.value = false;
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function confirmDelete(): Promise<void> {
    if (!mediaId.value) return;
    deleteLoading.value = true;
    const name = displayName.value;
    try {
      await mediaStore.deleteMedia(mediaId.value);
      notify.success("File deleted", `"${name}" was permanently removed.`, {
        position: "bottom-right",
      });
      router.push({ name: "media-index" });
    } catch {
      notify.error("Delete failed", "We couldn't delete this file.", {
        position: "bottom-right",
      });
    } finally {
      deleteLoading.value = false;
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  onMounted(() => loadMedia());

  watch(mediaId, (id) => {
    if (id) loadMedia();
  });
</script>
