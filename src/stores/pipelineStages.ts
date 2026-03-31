import axios from "@/lib/axios";
import {
  createRequestCache,
  globalCacheRegistry,
  withCacheInvalidation,
} from "@/lib/useRequestCache";
import type {
  UniversalApiResponse,
  UniversalFetchParams,
} from "@/ui-table/types/universal.types";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface PipelineStage {
  id: number;
  pipeline_id: number;
  name: string;
  slug: string;
  display_name: string | null;
  display_label: string;
  display_order: number;
  color: string | null;
  wip_limit: number | null;
  has_wip_limit: boolean;
  status: number | PipelineStageStatusObject | null;
  extras: Record<string, unknown> | null;
  creator?: { id: number; name: string; email?: string };
  pipeline?: {
    id: number;
    name: string;
    slug: string;
    project?: {
      id: number;
      name: string;
      slug: string;
      workspace?: { id: number; name: string; slug: string };
    };
  };
  is_active: boolean;
  is_inactive: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStageStatusObject {
  value: number;
  label: string;
  description?: string;
  color: string;
  dot: string;
  badge: string;
}

export interface PipelineStageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PipelineStageStatusEnum {
  value: number;
  label: string;
  description: string;
  color: string;
  dot: string;
  badge: string;
}

export interface PipelineStageFormData {
  name: string;
  display_name?: string | null;
  display_order?: number;
  status: number;
  color?: string | null;
  wip_limit?: number | null;
  extras?: Record<string, unknown>;
}

export interface ReorderPayload {
  stages: { id: number; display_order: number }[];
}

export const usePipelineStageStore = defineStore("pipelineStage", () => {
  const stages = ref<PipelineStage[]>([]);
  const currentStage = ref<PipelineStage | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<PipelineStageMeta>({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 0,
  });
  const statuses = ref<PipelineStageStatusEnum[]>([]);
  const statusCounts = ref<Record<string, number>>({});

  const activeStage = computed(() => currentStage.value);
  const isLoading = computed(() => loading.value);
  const isDetailLoading = computed(() => detailLoading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value ?? "");

  function buildFilterParams(filters?: Record<string, any> | null) {
    return Object.fromEntries(
      Object.entries(filters ?? {}).filter(([, v]) => {
        if (v == null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      }),
    );
  }

  function extractMessage(err: unknown, fallback: string): string {
    const e = err as AxiosError<{ message?: string }>;
    return e.response?.data?.message ?? fallback;
  }

  // ── fetchStages ───────────────────────────────────────────────────────────
  // CHANGED: wrapped with createRequestCache. Same name, same signature.
  const fetchStages = createRequestCache(
    async (
      params: UniversalFetchParams & { pipelineId: number },
    ): Promise<UniversalApiResponse<PipelineStage>> => {
      const { data } = await axios.get<UniversalApiResponse<PipelineStage>>(
        `/pipelines/${params.pipelineId}/stages`,
        {
          params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search || undefined,
            sort_by: params.sortBy || undefined,
            sort_order: params.sortOrder || undefined,
            ...buildFilterParams(params.filters),
          },
        },
      );
      return data;
    },
    {
      ttlMs: 60_000,
      swrMs: 15_000,
      maxRetries: 2,
      tags: ["pipeline-stages"],
    },
  );

  async function fetchStage(id: number): Promise<PipelineStage> {
    detailLoading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<{ data: PipelineStage }>(
        `/stages/${id}`,
      );
      currentStage.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to fetch pipeline stage");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }

  async function fetchStatusCounts(pipelineId: number): Promise<void> {
    try {
      const { data } = await axios.get<{ data: Record<string, number> }>(
        `/pipelines/${pipelineId}/stages/counts`,
      );
      statusCounts.value = data.data ?? {};
    } catch (err) {
      console.error("[PipelineStageStore] fetchStatusCounts failed:", err);
    }
  }

  // ── createStage ───────────────────────────────────────────────────────────
  // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
  const createStage = withCacheInvalidation(
    async (
      pipelineId: number,
      payload: PipelineStageFormData,
    ): Promise<PipelineStage> => {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.post<{ data: PipelineStage }>(
          `/pipelines/${pipelineId}/stages`,
          payload,
        );
        stages.value.push(data.data);
        meta.value.total += 1;
        fetchStatusCounts(pipelineId);
        return data.data;
      } catch (err) {
        error.value = extractMessage(err, "Failed to create pipeline stage");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    fetchStages,
  );

  // ── updateStage ───────────────────────────────────────────────────────────
  // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
  const updateStage = withCacheInvalidation(
    async (
      id: number,
      payload: Partial<PipelineStageFormData>,
    ): Promise<PipelineStage> => {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.post<{ data: PipelineStage }>(
          `/stages/${id}/update`,
          payload,
        );
        const idx = stages.value.findIndex((s) => s.id === id);
        if (idx !== -1) stages.value[idx] = data.data;
        if (currentStage.value?.id === id) currentStage.value = data.data;
        if (data.data.pipeline_id) fetchStatusCounts(data.data.pipeline_id);
        return data.data;
      } catch (err) {
        error.value = extractMessage(err, "Failed to update pipeline stage");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    fetchStages,
  );

  // ── deleteStage ───────────────────────────────────────────────────────────
  // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
  const deleteStage = withCacheInvalidation(
    async (id: number, pipelineId: number): Promise<void> => {
      loading.value = true;
      error.value = null;
      try {
        await axios.delete(`/stages/${id}`);
        stages.value = stages.value.filter((s) => s.id !== id);
        meta.value.total = Math.max(0, meta.value.total - 1);
        if (currentStage.value?.id === id) currentStage.value = null;
        fetchStatusCounts(pipelineId);
      } catch (err) {
        error.value = extractMessage(err, "Failed to delete pipeline stage");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    fetchStages,
  );

  // ── reorderStages ─────────────────────────────────────────────────────────
  // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
  const reorderStages = withCacheInvalidation(
    async (
      pipelineId: number,
      payload: ReorderPayload,
    ): Promise<PipelineStage[]> => {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.post<{ data: PipelineStage[] }>(
          `/pipelines/${pipelineId}/stages/reorder`,
          payload,
        );
        stages.value = data.data;
        return data.data;
      } catch (err) {
        error.value = extractMessage(err, "Failed to reorder stages");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    fetchStages,
  );

  async function fetchStatuses(): Promise<PipelineStageStatusEnum[]> {
    if (statuses.value.length > 0) return statuses.value;
    try {
      const { data } = await axios.get<{ data: PipelineStageStatusEnum[] }>(
        "/enums/pipeline-stage-statuses",
      );
      statuses.value = Array.isArray(data.data) ? data.data : [];
      return statuses.value;
    } catch (err) {
      console.error("[PipelineStageStore] fetchStatuses failed:", err);
      return [];
    }
  }

  function clearError(): void {
    error.value = null;
  }

  function $reset(): void {
    stages.value = [];
    currentStage.value = null;
    loading.value = false;
    detailLoading.value = false;
    error.value = null;
    statuses.value = [];
    statusCounts.value = {};
    meta.value = { current_page: 1, per_page: 25, total: 0, last_page: 0 };
    globalCacheRegistry.invalidateTag("pipeline-stages");
  }

  // ── return — IDENTICAL to original ───────────────────────────────────────
  return {
    stages,
    currentStage,
    loading,
    detailLoading,
    error,
    meta,
    statuses,
    statusCounts,

    activeStage,
    isLoading,
    isDetailLoading,
    hasError,
    errorMessage,

    fetchStages,
    fetchStage,
    fetchStatusCounts,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
    fetchStatuses,
    clearError,
    $reset,
  };
});
