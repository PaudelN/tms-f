import axios from "@/lib/axios";
import {
  createRequestCache,
  globalCacheRegistry,
  withCacheInvalidation,
} from "@/lib/useRequestCache";
import type {
  KanbanBoardFetchParams,
  KanbanBoardResponse,
  KanbanMoveEvent,
  KanbanMovePayload,
  KanbanReorderEvent,
} from "@/ui-table/types/kanban.types";
import type {
  UniversalApiResponse,
  UniversalFetchParams,
} from "@/ui-table/types/universal.types";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// ── Entities ───────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  workspace_id: number;
  name: string;
  slug: string;
  status: string | null;
  visibility: string | null;
  description: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  task_count?: number;
  extra?: Record<string, unknown> | null;
  creator?: { id: number; name: string; email: string };
  workspace?: { id: number; name: string; slug: string };
  created_at: string;
  updated_at: string;
}

export interface ProjectMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ProjectStatus {
  value: string;
  label: string;
  description: string;
  dot: string;
  badge: string;
  color?: string;
}

export interface ProjectVisibility {
  value: string;
  label: string;
  description: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status?: string;
  visibility?: string;
  cover_image?: string;
  start_date?: string;
  end_date?: string;
  extra?: Record<string, unknown>;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useProjectStore = defineStore("project", () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<ProjectMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 0,
  });
  const statuses = ref<ProjectStatus[]>([]);
  const visibilities = ref<ProjectVisibility[]>([]);
  const statusCounts = ref<Record<string, number>>({});

  const activeProject = computed(() => currentProject.value);
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

  // ══════════════════════════════════════════════════════════════════════════
  // READ
  // ══════════════════════════════════════════════════════════════════════════

  // ── CHANGE 1 of 5 ──────────────────────────────────────────────────────────
  // Wrap fetchProjects with createRequestCache.
  // The public name stays fetchProjects — nothing in the return{} or any
  // component needs to change. The raw logic is identical to what was here before.
  const fetchProjects = createRequestCache(
    async (
      params: UniversalFetchParams & { workspaceId: number },
    ): Promise<UniversalApiResponse<Project>> => {
      const { data } = await axios.get<UniversalApiResponse<Project>>(
        `/workspaces/${params.workspaceId}/projects`,
        {
          params: {
            page: params.page,
            per_page: params.perPage,
            search: params.search || undefined,
            sort_by: params.sortBy || undefined,
            sort_order: params.sortOrder || undefined,
            kanban_stage: params.kanbanStage || undefined,
            ...buildFilterParams(params.filters),
          },
        },
      );
      return data;
    },
    {
      ttlMs: 60_000, // projects are stable — 1 min fresh window
      swrMs: 20_000, // serve stale + background refresh for 20 s after
      maxRetries: 2, // retry twice on network failure with back-off
      tags: ["projects"], // globalCacheRegistry.invalidateTag('projects')
      // busts this + fetchKanbanBoard in one call
    },
  );

  async function fetchProject(id: number): Promise<Project> {
    detailLoading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<{ data: Project }>(`/projects/${id}`);
      currentProject.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to fetch project");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // KANBAN
  // ══════════════════════════════════════════════════════════════════════════

  // ── CHANGE 2 of 5 ──────────────────────────────────────────────────────────
  // Same treatment for fetchKanbanBoard.
  const fetchKanbanBoard = createRequestCache(
    async (
      params: KanbanBoardFetchParams & { workspaceId: number },
    ): Promise<KanbanBoardResponse<Project>> => {
      const { data } = await axios.get<KanbanBoardResponse<Project>>(
        `/workspaces/${params.workspaceId}/projects/kanban/board`,
        {
          params: {
            search: params.search || undefined,
            per_page: params.perPage ?? 50,
            ...buildFilterParams(params.filters),
          },
        },
      );
      return data;
    },
    {
      ttlMs: 30_000,
      swrMs: 10_000,
      maxRetries: 2,
      tags: ["projects"], // same tag — one invalidateTag call busts both
    },
  );

  async function fetchStatusCounts(workspaceId: number): Promise<void> {
    try {
      const { data } = await axios.get<{ data: Record<string, number> }>(
        `/workspaces/${workspaceId}/projects/counts`,
      );
      statusCounts.value = data.data ?? {};
    } catch (err) {
      console.error("[ProjectStore] fetchStatusCounts failed:", err);
    }
  }

  async function moveCard(
    event: KanbanMoveEvent<Project>,
    workspaceId: number,
  ): Promise<void> {
    await axios.post(`/workspaces/${workspaceId}/projects/kanban/move`, {
      model_id: event.item.id,
      column_id: event.toStage,
    } satisfies KanbanMovePayload);
    fetchStatusCounts(workspaceId);
  }

  async function reorderCards(
    event: KanbanReorderEvent,
    workspaceId: number,
  ): Promise<void> {
    await axios.post(`/workspaces/${workspaceId}/projects/kanban/reorder`, {
      stage_value: event.stage,
      ordered_ids: event.orderedIds,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WRITE
  // ══════════════════════════════════════════════════════════════════════════

  // ── CHANGE 3 of 5 ──────────────────────────────────────────────────────────
  // Replace the manual fetchProjects.invalidate() call that was already here
  // with withCacheInvalidation so the cache is also busted if the request
  // throws (the finally block always fires). Function signature is identical —
  // callers don't change.
  const createProject = withCacheInvalidation(
    async (workspaceId: number, payload: ProjectFormData): Promise<Project> => {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.post<{ data: Project }>(
          `/workspaces/${workspaceId}/projects`,
          payload,
        );
        projects.value.unshift(data.data);
        meta.value.total += 1;
        fetchStatusCounts(workspaceId);
        return data.data;
      } catch (err) {
        error.value = extractMessage(err, "Failed to create project");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    [fetchProjects, fetchKanbanBoard], // both busted in finally — always
  );

  // ── CHANGE 4 of 5 ──────────────────────────────────────────────────────────
  // updateProject had no invalidation before. Wrap it so the cache is busted
  // after every successful update. Body is word-for-word identical.
  const updateProject = withCacheInvalidation(
    async (id: number, payload: ProjectFormData): Promise<Project> => {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.post<{ data: Project }>(
          `/projects/${id}/update`,
          payload,
        );
        const idx = projects.value.findIndex((p) => p.id === id);
        if (idx !== -1) projects.value[idx] = data.data;
        if (currentProject.value?.id === id) currentProject.value = data.data;
        if (data.data.workspace_id) fetchStatusCounts(data.data.workspace_id);
        return data.data;
      } catch (err) {
        error.value = extractMessage(err, "Failed to update project");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    [fetchProjects, fetchKanbanBoard],
  );

  // ── CHANGE 5 of 5 ──────────────────────────────────────────────────────────
  // deleteProject had no invalidation before. Same pattern.
  const deleteProject = withCacheInvalidation(
    async (id: number, workspaceId: number): Promise<void> => {
      loading.value = true;
      error.value = null;
      try {
        await axios.delete(`/projects/${id}`);
        projects.value = projects.value.filter((p) => p.id !== id);
        meta.value.total = Math.max(0, meta.value.total - 1);
        if (currentProject.value?.id === id) currentProject.value = null;
        fetchStatusCounts(workspaceId);
      } catch (err) {
        error.value = extractMessage(err, "Failed to delete project");
        throw err;
      } finally {
        loading.value = false;
      }
    },
    [fetchProjects, fetchKanbanBoard],
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ENUMS  — unchanged, the existing ref-guard is already optimal
  // ══════════════════════════════════════════════════════════════════════════

  async function fetchStatuses(): Promise<ProjectStatus[]> {
    if (statuses.value.length > 0) return statuses.value;
    try {
      const { data } = await axios.get<{ data: ProjectStatus[] }>(
        "/enums/project-statuses",
      );
      statuses.value = Array.isArray(data.data) ? data.data : [];
      return statuses.value;
    } catch (err) {
      console.error("[ProjectStore] fetchStatuses failed:", err);
      return [];
    }
  }

  async function fetchVisibilities(): Promise<ProjectVisibility[]> {
    if (visibilities.value.length > 0) return visibilities.value;
    try {
      const { data } = await axios.get<{ data: ProjectVisibility[] }>(
        "/enums/project-visibilities",
      );
      visibilities.value = Array.isArray(data.data) ? data.data : [];
      return visibilities.value;
    } catch (err) {
      console.error("[ProjectStore] fetchVisibilities failed:", err);
      return [];
    }
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  function clearError(): void {
    error.value = null;
  }

  function $reset(): void {
    projects.value = [];
    currentProject.value = null;
    loading.value = false;
    detailLoading.value = false;
    error.value = null;
    statuses.value = [];
    visibilities.value = [];
    statusCounts.value = {};
    meta.value = { current_page: 1, per_page: 10, total: 0, last_page: 0 };
    // Also wipe the cache so a post-logout mount always fetches fresh
    globalCacheRegistry.invalidateTag("projects");
  }

  // ── Return — IDENTICAL to your original. Zero changes here. ────────────────
  return {
    projects,
    currentProject,
    loading,
    detailLoading,
    error,
    meta,
    statuses,
    visibilities,
    statusCounts,

    activeProject,
    isLoading,
    isDetailLoading,
    hasError,
    errorMessage,

    fetchProjects,
    fetchProject,
    fetchKanbanBoard,
    fetchStatusCounts,
    moveCard,
    reorderCards,
    createProject,
    updateProject,
    deleteProject,
    fetchStatuses,
    fetchVisibilities,
    clearError,
    $reset,
  };
});
