import axios from "@/lib/axios";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// ── Entities ───────────────────────────────────────────────────────────────────

export type MediaType = "image" | "video" | "document" | "other";

export interface MediaCreator {
  id: number;
  name: string;
  email?: string;
}

export interface MediaProject {
  id: number;
  name: string;
  slug: string;
}

export interface Media {
  id: number;
  project_id: number;
  created_by: number;
  name: string;
  original_name: string;
  path: string;
  mime_type: string;
  size: number;
  disk: string;
  extra: Record<string, unknown> | null;
  type: MediaType;
  url: string;
  human_size: string;
  creator?: MediaCreator;
  project?: MediaProject;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MediaMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface MediaListResponse {
  status: string;
  message: string;
  data: Media[];
  meta: MediaMeta;
}

export interface MediaUploadPayload {
  file: File;
  name?: string;
  extra?: Record<string, unknown>;
}

export interface MediaUpdatePayload {
  name?: string;
  extra?: Record<string, unknown>;
}

export interface MediaFetchParams {
  page?: number;
  per_page?: number;
  type?: MediaType | "";
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractMessage(err: unknown, fallback: string): string {
  const e = err as AxiosError<{ message?: string }>;
  return e.response?.data?.message ?? fallback;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useMediaStore = defineStore("media", () => {
  // ── State ────────────────────────────────────────────────────────────────────
  const items = ref<Media[]>([]);
  const currentMedia = ref<Media | null>(null);
  const loading = ref(false);
  const uploading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<MediaMeta>({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 0,
  });
  const activeFilter = ref<MediaType | "">("");

  // ── Computed ─────────────────────────────────────────────────────────────────
  const isLoading = computed(() => loading.value);
  const isUploading = computed(() => uploading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value ?? "");
  const isEmpty = computed(() => items.value.length === 0);
  const totalCount = computed(() => meta.value.total);
  const images = computed(() => items.value.filter((m) => m.type === "image"));
  const documents = computed(() =>
    items.value.filter((m) => m.type === "document"),
  );
  const videos = computed(() => items.value.filter((m) => m.type === "video"));

  // ══════════════════════════════════════════════════════════════════════════════
  // READ
  // ══════════════════════════════════════════════════════════════════════════════

  async function fetchMedia(
    projectId: number,
    params: MediaFetchParams = {},
  ): Promise<MediaListResponse> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<MediaListResponse>(
        `/projects/${projectId}/media`,
        {
          params: {
            page: params.page ?? 1,
            per_page: params.per_page ?? 20,
            type: params.type || undefined,
          },
        },
      );
      items.value = data.data;
      meta.value = data.meta;
      return data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to fetch media");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreMedia(
    projectId: number,
    params: MediaFetchParams = {},
  ): Promise<MediaListResponse> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<MediaListResponse>(
        `/projects/${projectId}/media`,
        {
          params: {
            page: params.page ?? meta.value.current_page + 1,
            per_page: params.per_page ?? meta.value.per_page,
            type: params.type || undefined,
          },
        },
      );
      items.value = [...items.value, ...data.data];
      meta.value = data.meta;
      return data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to load more media");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: number): Promise<Media> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<{ data: Media }>(`/media/${id}`);
      currentMedia.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to fetch media item");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // WRITE
  // ══════════════════════════════════════════════════════════════════════════════

  async function uploadMedia(
    projectId: number,
    payload: MediaUploadPayload,
    onProgress?: (percent: number) => void,
  ): Promise<Media> {
    uploading.value = true;
    error.value = null;
    try {
      const form = new FormData();
      form.append("file", payload.file);
      if (payload.name) form.append("name", payload.name);
      if (payload.extra) form.append("extra", JSON.stringify(payload.extra));

      const { data } = await axios.post<{ data: Media; message: string }>(
        `/projects/${projectId}/media`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (onProgress && e.total) {
              onProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        },
      );

      items.value.unshift(data.data);
      meta.value.total += 1;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to upload media");
      throw err;
    } finally {
      uploading.value = false;
    }
  }

  async function updateMedia(
    id: number,
    payload: MediaUpdatePayload,
  ): Promise<Media> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.put<{ data: Media }>(
        `/media/${id}`,
        payload,
      );
      const idx = items.value.findIndex((m) => m.id === id);
      if (idx !== -1) items.value[idx] = data.data;
      if (currentMedia.value?.id === id) currentMedia.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to update media");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteMedia(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`/media/${id}`);
      items.value = items.value.filter((m) => m.id !== id);
      meta.value.total = Math.max(0, meta.value.total - 1);
      if (currentMedia.value?.id === id) currentMedia.value = null;
    } catch (err) {
      error.value = extractMessage(err, "Failed to delete media");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────
  function setFilter(type: MediaType | ""): void {
    activeFilter.value = type;
  }

  function clearError(): void {
    error.value = null;
  }

  function $reset(): void {
    items.value = [];
    currentMedia.value = null;
    loading.value = false;
    uploading.value = false;
    error.value = null;
    activeFilter.value = "";
    meta.value = { current_page: 1, per_page: 20, total: 0, last_page: 0 };
  }

  return {
    items,
    currentMedia,
    loading,
    uploading,
    error,
    meta,
    activeFilter,
    isLoading,
    isUploading,
    hasError,
    errorMessage,
    isEmpty,
    totalCount,
    images,
    documents,
    videos,
    fetchMedia,
    loadMoreMedia,
    fetchOne,
    uploadMedia,
    updateMedia,
    deleteMedia,
    setFilter,
    clearError,
    $reset,
  };
});
