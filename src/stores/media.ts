import axios from "@/lib/axios";
import {
  createRequestCache,
  globalCacheRegistry,
  withCacheInvalidation,
} from "@/lib/useRequestCache";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type AggregateType = "image" | "video" | "audio" | "document" | "other";

export interface Media {
  id: number;
  disk: string;
  directory: string;
  filename: string;
  extension: string;
  mime_type: string;
  aggregate_type: AggregateType;
  size: number;
  original_filename: string | null;
  alt: string | null;
  uploaded_by: number | null;
  url: string;
  path: string;
  human_size: string;
  uploader?: { id: number; name: string; email: string } | null;
  pivot?: { tag: string; order: number };
  created_at: string;
  updated_at: string;
}

/** @deprecated Use Media */
export type MediaItem = Media;

export interface MediaMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface MediaFetchParams {
  page?: number;
  perPage?: number;
  per_page?: number;
  search?: string;
  aggregate_type?: AggregateType | "";
  uploaded_by?: number | null;
  sort_by?: "created_at" | "size" | "original_filename" | "mime_type";
  sort_order?: "asc" | "desc";
}

export interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: Media;
  tag?: string;
  alt?: string;
}

export interface ModelMediaParams {
  tag?: string;
  page?: number;
  per_page?: number;
  perPage?: number;
}

export interface AttachPayload {
  media_id: number;
  tag?: string;
  order?: number;
}

export type MorphType =
  | "tasks"
  | "users"
  | "projects"
  | "pipelines"
  | "workspaces";

export const useMediaStore = defineStore("media", () => {
  const items = ref<Media[]>([]);
  const currentItem = ref<Media | null>(null);
  const meta = ref<MediaMeta>({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 0,
  });

  const modelMediaCache = ref<Record<string, Media[]>>({});
  const uploadQueue = ref<UploadQueueItem[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const isDetailLoading = computed(() => detailLoading.value);
  const hasError = computed(() => !!error.value);

  const activeUploads = computed(() =>
    uploadQueue.value.filter(
      (u) => u.status === "uploading" || u.status === "pending",
    ),
  );
  const completedUploads = computed(() =>
    uploadQueue.value.filter((u) => u.status === "done"),
  );
  const failedUploads = computed(() =>
    uploadQueue.value.filter((u) => u.status === "error"),
  );
  const totalQueueProgress = computed(() => {
    if (uploadQueue.value.length === 0) return 0;
    const sum = uploadQueue.value.reduce((acc, u) => acc + u.progress, 0);
    return Math.round(sum / uploadQueue.value.length);
  });

  function extractMessage(err: unknown, fallback: string): string {
    const e = err as AxiosError<{ message?: string }>;
    return e?.response?.data?.message ?? fallback;
  }

  function modelCacheKey(
    morphType: string,
    morphId: number,
    tag?: string,
  ): string {
    return tag ? `${morphType}:${morphId}:${tag}` : `${morphType}:${morphId}`;
  }

  function genId(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // ── fetchMedia ────────────────────────────────────────────────────────────
  // CHANGED: wrapped with createRequestCache. Same name, same signature.
  // Note: we still sync items + meta inside so existing watchers keep working.
  const fetchMedia = createRequestCache(
    async (
      params: MediaFetchParams = {},
    ): Promise<{ data: Media[]; meta: MediaMeta }> => {
      loading.value = true;
      error.value = null;
      try {
        const perPage = params.perPage ?? params.per_page ?? 20;
        const response = await axios.get<{
          data: Media[];
          meta: MediaMeta;
          links: unknown;
        }>("/media", {
          params: {
            page: params.page ?? 1,
            per_page: perPage,
            search: params.search || undefined,
            aggregate_type: params.aggregate_type || undefined,
            uploaded_by: params.uploaded_by ?? undefined,
            sort_by: params.sort_by ?? "created_at",
            sort_order: params.sort_order ?? "desc",
          },
        });

        const payload = response.data;
        items.value = payload.data ?? [];
        meta.value = payload.meta ?? {
          current_page: 1,
          per_page: 20,
          total: 0,
          last_page: 1,
        };

        return {
          data: payload.data ?? [],
          meta: payload.meta ?? meta.value,
        };
      } catch (err) {
        error.value = extractMessage(err, "Failed to load media library.");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    {
      ttlMs: 30_000,
      swrMs: 10_000,
      maxRetries: 2,
      tags: ["media"],
    },
  );

  // countMedia — lightweight, no pagination state, no cache needed
  async function countMedia(aggregate_type: AggregateType): Promise<number> {
    const response = await axios.get<{ meta: MediaMeta }>("/media", {
      params: { page: 1, per_page: 1, aggregate_type },
    });
    return response.data?.meta?.total ?? 0;
  }

  async function fetchMediaItem(id: number): Promise<Media> {
    detailLoading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<{ data: Media }>(`/media/${id}`);
      currentItem.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to load media item.");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }

  // uploadMedia — streaming progress, can't be cached; bust list after
  // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
  const uploadMedia = withCacheInvalidation(
    async (
      file: File,
      alt?: string,
      onProgress?: (percent: number) => void,
    ): Promise<Media> => {
      const form = new FormData();
      form.append("file", file);
      if (alt) form.append("alt", alt);

      const { data } = await axios.post<{ data: Media }>("/media", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total && onProgress)
            onProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      items.value.unshift(data.data);
      meta.value.total += 1;
      return data.data;
    },
    fetchMedia,
  );

  // updateMedia — CHANGED: withCacheInvalidation. Same name, same signature.
  const updateMedia = withCacheInvalidation(
    async (id: number, alt: string | null): Promise<Media> => {
      const { data } = await axios.patch<{ data: Media }>(`/media/${id}`, {
        alt,
      });
      _syncItem(data.data);
      return data.data;
    },
    fetchMedia,
  );

  // deleteMedia — CHANGED: withCacheInvalidation. Same name, same signature.
  const deleteMedia = withCacheInvalidation(
    async (id: number): Promise<void> => {
      await axios.delete(`/media/${id}`);
      items.value = items.value.filter((m) => m.id !== id);
      meta.value.total = Math.max(0, meta.value.total - 1);
      if (currentItem.value?.id === id) currentItem.value = null;
      for (const key of Object.keys(modelMediaCache.value)) {
        modelMediaCache.value[key] = modelMediaCache.value[key].filter(
          (m) => m.id !== id,
        );
      }
    },
    fetchMedia,
  );

  function _syncItem(updated: Media) {
    const idx = items.value.findIndex((m) => m.id === updated.id);
    if (idx !== -1) items.value[idx] = updated;
    if (currentItem.value?.id === updated.id) currentItem.value = updated;
    for (const key of Object.keys(modelMediaCache.value)) {
      const ci = modelMediaCache.value[key].findIndex(
        (m) => m.id === updated.id,
      );
      if (ci !== -1) modelMediaCache.value[key][ci] = updated;
    }
  }

  // ── Upload queue — unchanged, no list cache involved ──────────────────────

  function enqueue(files: File[], tag?: string, alt?: string): string[] {
    const ids: string[] = [];
    for (const file of files) {
      const id = genId();
      uploadQueue.value.push({
        id,
        file,
        progress: 0,
        status: "pending",
        tag,
        alt,
      });
      ids.push(id);
    }
    return ids;
  }

  async function flushQueue(): Promise<Media[]> {
    const results: Media[] = [];
    for (const upload of uploadQueue.value.filter(
      (u) => u.status === "pending",
    )) {
      upload.status = "uploading";
      try {
        const result = await uploadMedia(upload.file, upload.alt, (p) => {
          upload.progress = p;
        });
        upload.status = "done";
        upload.progress = 100;
        upload.result = result;
        results.push(result);
      } catch (err) {
        upload.status = "error";
        upload.error = extractMessage(err, "Upload failed.");
      }
    }
    return results;
  }

  async function flushQueueToModel(
    morphType: MorphType,
    morphId: number,
    tag = "default",
  ): Promise<Media[]> {
    const results: Media[] = [];
    for (const upload of uploadQueue.value.filter(
      (u) => u.status === "pending",
    )) {
      upload.status = "uploading";
      try {
        const result = await uploadAndAttach(
          morphType,
          morphId,
          upload.file,
          upload.tag ?? tag,
          upload.alt,
          (p) => {
            upload.progress = p;
          },
        );
        upload.status = "done";
        upload.progress = 100;
        upload.result = result;
        results.push(result);
        invalidateModelCache(morphType, morphId);
      } catch (err) {
        upload.status = "error";
        upload.error = extractMessage(err, "Upload failed.");
      }
    }
    return results;
  }

  function removeFromQueue(id: string): void {
    uploadQueue.value = uploadQueue.value.filter((u) => u.id !== id);
  }

  function retryQueueItem(id: string): void {
    const item = uploadQueue.value.find((u) => u.id === id);
    if (item) {
      item.status = "pending";
      item.progress = 0;
      item.error = undefined;
    }
  }

  function clearCompletedQueue(): void {
    uploadQueue.value = uploadQueue.value.filter(
      (u) => u.status !== "done" && u.status !== "error",
    );
  }

  function clearQueue(): void {
    uploadQueue.value = [];
  }

  // ── Polymorphic model media — unchanged ───────────────────────────────────
  // These already use modelMediaCache (ref-based) — no createRequestCache needed.

  async function fetchModelMedia(
    morphType: MorphType,
    morphId: number,
    params: ModelMediaParams = {},
  ): Promise<Media[]> {
    const key = modelCacheKey(morphType, morphId, params.tag);
    const perPage = params.perPage ?? params.per_page ?? 100;
    const { data } = await axios.get<{ data: Media[]; meta: unknown }>(
      `/${morphType}/${morphId}/media`,
      {
        params: {
          tag: params.tag || undefined,
          page: params.page ?? 1,
          per_page: perPage,
        },
      },
    );
    modelMediaCache.value[key] = data.data;
    return data.data;
  }

  function invalidateModelCache(morphType: string, morphId: number): void {
    for (const key of Object.keys(modelMediaCache.value)) {
      if (key.startsWith(`${morphType}:${morphId}`)) {
        delete modelMediaCache.value[key];
      }
    }
  }

  async function uploadAndAttach(
    morphType: MorphType,
    morphId: number,
    file: File,
    tag = "default",
    alt?: string,
    onProgress?: (percent: number) => void,
  ): Promise<Media> {
    const form = new FormData();
    form.append("file", file);
    form.append("tag", tag);
    if (alt) form.append("alt", alt);

    const { data } = await axios.post<{ data: Media }>(
      `/${morphType}/${morphId}/media/upload`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total && onProgress)
            onProgress(Math.round((e.loaded / e.total) * 100));
        },
      },
    );
    items.value.unshift(data.data);
    meta.value.total += 1;
    invalidateModelCache(morphType, morphId);
    return data.data;
  }

  async function attachToModel(
    morphType: MorphType,
    morphId: number,
    payload: AttachPayload,
  ): Promise<void> {
    await axios.post(`/${morphType}/${morphId}/media/attach`, {
      media_id: payload.media_id,
      tag: payload.tag ?? "default",
      order: payload.order,
    });
    invalidateModelCache(morphType, morphId);
  }

  async function attachExisting(
    mediaId: number,
    morphType: MorphType,
    morphId: number,
    tag = "default",
  ): Promise<void> {
    await attachToModel(morphType, morphId, { media_id: mediaId, tag });
  }

  async function detachFromModel(
    mediaId: number,
    morphType: MorphType,
    morphId: number,
    tag = "default",
  ): Promise<void> {
    await axios.delete(`/${morphType}/${morphId}/media/${mediaId}/detach`, {
      params: { tag },
    });
    invalidateModelCache(morphType, morphId);
  }

  async function reorderModelMedia(
    morphType: MorphType,
    morphId: number,
    orderedIds: number[],
    tag = "default",
  ): Promise<void> {
    await axios.patch(`/${morphType}/${morphId}/media/reorder`, {
      ordered_ids: orderedIds,
      tag,
    });
    const key = modelCacheKey(morphType, morphId, tag);
    if (modelMediaCache.value[key]) {
      const sorted = [...modelMediaCache.value[key]].sort(
        (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id),
      );
      modelMediaCache.value[key] = sorted;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  function $reset(): void {
    items.value = [];
    currentItem.value = null;
    meta.value = { current_page: 1, per_page: 20, total: 0, last_page: 0 };
    modelMediaCache.value = {};
    uploadQueue.value = [];
    loading.value = false;
    detailLoading.value = false;
    error.value = null;
    globalCacheRegistry.invalidateTag("media");
  }

  // ── return — IDENTICAL to original ───────────────────────────────────────
  return {
    items,
    currentItem,
    meta,
    modelMediaCache,
    uploadQueue,
    loading,
    detailLoading,
    error,

    isLoading,
    isDetailLoading,
    hasError,
    activeUploads,
    completedUploads,
    failedUploads,
    totalQueueProgress,

    fetchMedia,
    countMedia,
    fetchMediaItem,
    uploadMedia,
    updateMedia,
    deleteMedia,

    enqueue,
    flushQueue,
    flushQueueToModel,
    removeFromQueue,
    retryQueueItem,
    clearCompletedQueue,
    clearQueue,

    fetchModelMedia,
    uploadAndAttach,
    attachToModel,
    attachExisting,
    detachFromModel,
    reorderModelMedia,
    invalidateModelCache,

    clearError,
    $reset,
  };
});
