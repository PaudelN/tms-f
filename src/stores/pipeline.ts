import axios from "@/lib/axios";
import type {
  UniversalApiResponse,
  UniversalFetchParams,
} from "@/ui-table/types/universal.types";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// ── Entities ───────────────────────────────────────────────────────────────────

export interface Pipeline {
  id: number;
  project_id: number;
  name: string;
  slug: string;
  description: string | null;
  /**
   * The API may return status as:
   *   • a plain integer:  1  (from list queries before resource transforms)
   *   • a full object:    { value: 1, label: "Active", color: "green", dot: "...", badge: "..." }
   * Use extractStatusValue() / extractStatusLabel() throughout the app.
   */
  status: number | PipelineStatusObject | null;
  extras: Record<string, unknown> | null;
  stages_count?: number;
  creator?: { id: number; name: string; email: string };
  project?: {
    id: number;
    name: string;
    slug: string;
    workspace?: { id: number; name: string; slug: string };
  };
  is_active?: boolean;
  is_inactive?: boolean;
  created_at: string;
  updated_at: string;
  stages?: PipelineStagePreview[];
}

/** Lightweight stage shape embedded in the Pipeline detail response */
export interface PipelineStagePreview {
  id: number;
  name: string;
  slug: string;
  display_name: string | null;
  display_label: string;
  display_order: number;
  color: string | null;
  wip_limit: number | null;
  is_active: boolean;
  status: {
    value: number;
    label: string;
    dot: string;
    badge: string;
  };
}

export interface PipelineStatusObject {
  value: number;
  label: string;
  description?: string;
  color: string;
  dot: string;
  badge: string;
}

export interface PipelineMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

/** Shape returned by GET /enums/pipeline-statuses */
export interface PipelineStatusEnum {
  value: number;
  label: string;
  description: string;
  color: string;
  dot: string;
  badge: string;
}

export interface PipelineFormData {
  name: string;
  description?: string;
  status?: number;
  extras?: Record<string, unknown>;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const usePipelineStore = defineStore("pipeline", () => {
  const pipelines = ref<Pipeline[]>([]);
  const currentPipeline = ref<Pipeline | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<PipelineMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 0,
  });
  const statuses = ref<PipelineStatusEnum[]>([]);
  const statusCounts = ref<Record<string, number>>({});

  // ── Computed aliases ────────────────────────────────────────────────────────
  const activePipeline = computed(() => currentPipeline.value);
  const isLoading = computed(() => loading.value);
  const isDetailLoading = computed(() => detailLoading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value ?? "");

  // ── Helpers ─────────────────────────────────────────────────────────────────

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

  // ══════════════════════════════════════════════════════════════════════════
  // READ
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * GET /projects/{projectId}/pipelines   — nested
   */
  async function fetchPipelines(
    params: UniversalFetchParams & { projectId: number },
  ): Promise<UniversalApiResponse<Pipeline>> {
    const { data } = await axios.get<UniversalApiResponse<Pipeline>>(
      `/projects/${params.projectId}/pipelines`,
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
  }

  async function fetchStagesForKanban(
    pipelineId: number,
  ): Promise<PipelineStagePreview[]> {
    try {
      const { data } = await axios.get<{ data: PipelineStagePreview[] }>(
        `/pipelines/${pipelineId}/stages`,
        {
          params: {
            per_page: 200,
            sort_by: "display_order",
            sort_order: "asc",
          },
        },
      );
      return data.data ?? [];
    } catch (err) {
      console.error("[PipelineStore] fetchStagesForKanban failed:", err);
      return [];
    }
  }

  /**
   * GET /pipelines/{id}   — shallow
   */
  async function fetchPipeline(id: number): Promise<Pipeline> {
    detailLoading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<{ data: Pipeline }>(`/pipelines/${id}`);
      currentPipeline.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to fetch pipeline");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }

  /**
   * GET /projects/{projectId}/pipelines/counts   — nested
   */
  async function fetchStatusCounts(projectId: number): Promise<void> {
    try {
      const { data } = await axios.get<{ data: Record<string, number> }>(
        `/projects/${projectId}/pipelines/counts`,
      );
      statusCounts.value = data.data ?? {};
    } catch (err) {
      console.error("[PipelineStore] fetchStatusCounts failed:", err);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WRITE — shallow /pipelines/{id}
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * POST /projects/{projectId}/pipelines   — nested
   */
  async function createPipeline(
    projectId: number,
    payload: PipelineFormData,
  ): Promise<Pipeline> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.post<{ data: Pipeline }>(
        `/projects/${projectId}/pipelines`,
        payload,
      );
      pipelines.value.unshift(data.data);
      meta.value.total += 1;
      fetchStatusCounts(projectId);
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to create pipeline");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * POST /pipelines/{id}/update   — shallow, POST to avoid CORS preflight
   */
  async function updatePipeline(
    id: number,
    payload: PipelineFormData,
  ): Promise<Pipeline> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.post<{ data: Pipeline }>(
        `/pipelines/${id}/update`,
        payload,
      );
      const idx = pipelines.value.findIndex((p) => p.id === id);
      if (idx !== -1) pipelines.value[idx] = data.data;
      if (currentPipeline.value?.id === id) currentPipeline.value = data.data;
      if (data.data.project_id) fetchStatusCounts(data.data.project_id);
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to update pipeline");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * DELETE /pipelines/{id}   — shallow
   */
  async function deletePipeline(id: number, projectId: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`/pipelines/${id}`);
      pipelines.value = pipelines.value.filter((p) => p.id !== id);
      meta.value.total = Math.max(0, meta.value.total - 1);
      if (currentPipeline.value?.id === id) currentPipeline.value = null;
      fetchStatusCounts(projectId);
    } catch (err) {
      error.value = extractMessage(err, "Failed to delete pipeline");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENUMS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * GET /enums/pipeline-statuses
   * Cached in-memory after first call.
   */
  async function fetchStatuses(): Promise<PipelineStatusEnum[]> {
    if (statuses.value.length > 0) return statuses.value;
    try {
      const { data } = await axios.get<{ data: PipelineStatusEnum[] }>(
        "/enums/pipeline-statuses",
      );
      statuses.value = Array.isArray(data.data) ? data.data : [];
      return statuses.value;
    } catch (err) {
      console.error("[PipelineStore] fetchStatuses failed:", err);
      return [];
    }
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  function clearError(): void {
    error.value = null;
  }

  function $reset(): void {
    pipelines.value = [];
    currentPipeline.value = null;
    loading.value = false;
    detailLoading.value = false;
    error.value = null;
    statuses.value = [];
    statusCounts.value = {};
    meta.value = { current_page: 1, per_page: 10, total: 0, last_page: 0 };
  }

  return {
    // State
    pipelines,
    currentPipeline,
    loading,
    detailLoading,
    error,
    meta,
    statuses,
    statusCounts,

    // Computed
    activePipeline,
    isLoading,
    isDetailLoading,
    hasError,
    errorMessage,

    // Actions
    fetchPipelines,
    fetchStagesForKanban,
    fetchPipeline,
    fetchStatusCounts,
    createPipeline,
    updatePipeline,
    deletePipeline,
    fetchStatuses,
    clearError,
    $reset,
  };
});
