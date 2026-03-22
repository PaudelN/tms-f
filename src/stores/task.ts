import axios from "@/lib/axios";
import type {
  UniversalApiResponse,
  UniversalFetchParams,
} from "@/ui-table/types/universal.types";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// ── Entities ───────────────────────────────────────────────────────────────────

export interface TaskPriorityObject {
  value: string;
  label: string;
  color: string;
  dot: string;
  badge: string;
}

export interface Task {
  id: number;
  task_number: string;
  title: string;
  description: string | null;
  priority: TaskPriorityObject | string | null;
  pipeline_id: number;
  pipeline_stage_id: number;
  project_id: number | null;
  due_date: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
  sort_order: number;
  extra: Record<string, unknown> | null;
  stage?: {
    id: number;
    name: string;
    display_label: string;
    color: string | null;
    wip_limit?: number | null;
  };
  pipeline?: { id: number; name: string; slug: string };
  project?: { id: number; name: string; slug: string };
  creator?: { id: number; name: string; email?: string };
  updater?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface TaskMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface TaskPriorityEnum {
  value: string;
  label: string;
  color: string;
  dot: string;
  badge: string;
}

export interface TaskFormData {
  title: string;
  description?: string | null;
  pipeline_stage_id: number;
  priority?: string;
  due_date?: string | null;
  extra?: Record<string, unknown>;
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useTaskStore = defineStore("task", () => {
  const tasks = ref<Task[]>([]);
  const currentTask = ref<Task | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<TaskMeta>({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 0,
  });
  const priorities = ref<TaskPriorityEnum[]>([]);

  // ── Computed aliases ────────────────────────────────────────────────────────
  const activeTask = computed(() => currentTask.value);
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
   * GET /pipelines/{pipelineId}/tasks
   * Serves UiTable, UiList, and UiKanban (via kanban_stage param).
   */
  async function fetchTasks(
    params: UniversalFetchParams & { pipelineId: number },
  ): Promise<UniversalApiResponse<Task>> {
    const { data } = await axios.get<UniversalApiResponse<Task>>(
      `/pipelines/${params.pipelineId}/tasks`,
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
   * GET /tasks/{id}  — shallow
   */
  async function fetchTask(id: number): Promise<Task> {
    detailLoading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get<{ data: Task }>(`/tasks/${id}`);
      currentTask.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to fetch task");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WRITE
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * POST /pipelines/{pipelineId}/tasks  — nested
   */
  async function createTask(
    pipelineId: number,
    payload: TaskFormData,
  ): Promise<Task> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.post<{ data: Task }>(
        `/pipelines/${pipelineId}/tasks`,
        payload,
      );
      tasks.value.unshift(data.data);
      meta.value.total += 1;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to create task");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * POST /tasks/{id}/update  — shallow POST to avoid CORS preflight
   */
  async function updateTask(
    id: number,
    payload: Partial<TaskFormData>,
  ): Promise<Task> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.post<{ data: Task }>(
        `/tasks/${id}/update`,
        payload,
      );
      const idx = tasks.value.findIndex((t) => t.id === id);
      if (idx !== -1) tasks.value[idx] = data.data;
      if (currentTask.value?.id === id) currentTask.value = data.data;
      return data.data;
    } catch (err) {
      error.value = extractMessage(err, "Failed to update task");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * DELETE /tasks/{id}  — shallow
   */
  async function deleteTask(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await axios.delete(`/tasks/${id}`);
      tasks.value = tasks.value.filter((t) => t.id !== id);
      meta.value.total = Math.max(0, meta.value.total - 1);
      if (currentTask.value?.id === id) currentTask.value = null;
    } catch (err) {
      error.value = extractMessage(err, "Failed to delete task");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENUMS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * GET /enums/task-priorities  — cached in-memory after first call
   */
  async function fetchPriorities(): Promise<TaskPriorityEnum[]> {
    if (priorities.value.length > 0) return priorities.value;
    try {
      const { data } = await axios.get<{ data: TaskPriorityEnum[] }>(
        "/enums/task-priorities",
      );
      priorities.value = Array.isArray(data.data) ? data.data : [];
      return priorities.value;
    } catch (err) {
      console.error("[TaskStore] fetchPriorities failed:", err);
      return [];
    }
  }

  async function fetchMyTasks(
    params?: UniversalFetchParams,
  ): Promise<UniversalApiResponse<Task>> {
    const { data } = await axios.get<UniversalApiResponse<Task>>("/tasks/my", {
      params: {
        page: params?.page ?? 1,
        per_page: params?.perPage ?? 25,
        search: params?.search || undefined,
        sort_by: params?.sortBy || undefined,
        sort_order: params?.sortOrder || undefined,
        ...buildFilterParams(params?.filters),
      },
    });
    return data;
  }

  async function fetchAllTasks(
    params?: UniversalFetchParams,
  ): Promise<UniversalApiResponse<Task>> {
    const { data } = await axios.get<UniversalApiResponse<Task>>("/tasks/all", {
      params: {
        page: params?.page ?? 1,
        per_page: params?.perPage ?? 25,
        search: params?.search || undefined,
        sort_by: params?.sortBy || undefined,
        sort_order: params?.sortOrder || undefined,
        ...buildFilterParams(params?.filters),
      },
    });
    return data;
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  function clearError(): void {
    error.value = null;
  }

  function $reset(): void {
    tasks.value = [];
    currentTask.value = null;
    loading.value = false;
    detailLoading.value = false;
    error.value = null;
    priorities.value = [];
    meta.value = { current_page: 1, per_page: 25, total: 0, last_page: 0 };
  }

  return {
    tasks,
    currentTask,
    loading,
    detailLoading,
    error,
    meta,
    priorities,
    activeTask,
    isLoading,
    isDetailLoading,
    hasError,
    errorMessage,
    fetchTasks,
    fetchMyTasks,
    fetchAllTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    fetchPriorities,
    clearError,
    $reset,
  };
});
