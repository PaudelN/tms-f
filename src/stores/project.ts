import axios from "@/lib/axios";
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
  // Sidebar list — writable so AppSidebar can assign after fetch
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

  // ── Computed aliases ────────────────────────────────────────────────────────
  const activeProject = computed(() => currentProject.value);
  const isLoading = computed(() => loading.value);
  const isDetailLoading = computed(() => detailLoading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value ?? "");

  // ── Internal helpers ────────────────────────────────────────────────────────

  /** Strip empty / null / [] values from filter objects before sending */
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
  // READ — all use shallow /projects/{id} except index/store which are nested
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * GET /workspaces/{workspaceId}/projects
   * Nested — workspace context required for listing.
   */
  async function fetchProjects(
    params: UniversalFetchParams & { workspaceId: number },
  ): Promise<UniversalApiResponse<Project>> {
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
  }

  /**
   * GET /projects/{id}          ← SHALLOW
   *
   * Laravel's ->shallow() registers:
   *   GET /projects/{project}   → ProjectController@show
   *
   * Do NOT call /workspaces/{ws}/projects/{id} for a single project —
   * that route does not exist in shallow mode and returns 404.
   */
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

  /**
   * GET /workspaces/{workspaceId}/projects/kanban/board  — nested
   */
  async function fetchKanbanBoard(
    params: KanbanBoardFetchParams & { workspaceId: number },
  ): Promise<KanbanBoardResponse<Project>> {
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
  }

  /**
   * GET /workspaces/{workspaceId}/projects/counts  — nested
   */
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

  /**
   * POST /workspaces/{workspaceId}/projects/kanban/move  — nested
   */
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

  /**
   * POST /workspaces/{workspaceId}/projects/kanban/reorder  — nested
   */
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
  // WRITE — all shallow /projects/{id}
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * POST /workspaces/{workspaceId}/projects  — nested (needs workspace scope)
   */
  async function createProject(
    workspaceId: number,
    payload: ProjectFormData,
  ): Promise<Project> {
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
  }

  /**
   * PATCH /projects/{id}         ← SHALLOW
   *
   * IMPORTANT: Laravel apiResource shallow registers PATCH, not PUT.
   * Using axios.put() here causes a 404 / 405 MethodNotAllowed.
   * Always use axios.patch() for update.
   */
  async function updateProject(
    id: number,
    payload: ProjectFormData,
  ): Promise<Project> {
    loading.value = true;
    error.value = null;
    try {
      // ✅ PATCH — matches Laravel's shallow apiResource registration
      const { data } = await axios.patch<{ data: Project }>(
        `/projects/${id}`,
        payload,
      );
      // Keep sidebar list in sync
      const idx = projects.value.findIndex((p) => p.id === id);
      if (idx !== -1) projects.value[idx] = data.data;
      // Keep detail view in sync
      if (currentProject.value?.id === id) currentProject.value = data.data;
      // Refresh status counts for the workspace this project belongs to
      if (data.data.workspace_id) fetchStatusCounts(data.data.workspace_id);
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to update project");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * DELETE /projects/{id}        ← SHALLOW
   */
  async function deleteProject(id: number, workspaceId: number): Promise<void> {
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
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENUMS  — flat routes, no workspace scope needed
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * GET /enums/project-statuses
   * Result is cached in-memory — second call returns immediately.
   */
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

  /**
   * GET /enums/project-visibilities
   * Result is cached in-memory — second call returns immediately.
   */
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
  }

  return {
    // State — exposed as writable so AppSidebar can assign projects directly
    projects,
    currentProject,
    loading,
    detailLoading,
    error,
    meta,
    statuses,
    visibilities,
    statusCounts,

    // Computed
    activeProject,
    isLoading,
    isDetailLoading,
    hasError,
    errorMessage,

    // Actions
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
