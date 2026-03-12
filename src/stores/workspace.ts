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

// ── Entity ─────────────────────────────────────────────────────────────────────

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  status: string | null;
  description: string | null;
  is_active: boolean;
  is_archived: boolean;
  pending: boolean;
  on_hold: boolean;
  completed: boolean;
  extra?: Record<string, unknown> | null;
  user_id: number;
  user?: { id: number; name: string; email: string };
  // Included in DetailResource when loaded via show()
  projects?: import("@/stores/project").Project[];
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface WorkspaceStatus {
  value: string;
  label: string;
  description: string;
  dot: string;
  badge: string;
  color?: string;
}

export interface WorkspaceFormData {
  name: string;
  description?: string;
  status?: string;
}

// How long a persisted workspace selection stays valid without any activity.
// After this period the store self-clears so the user picks fresh on next login.
const PERSIST_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ── Store ──────────────────────────────────────────────────────────────────────

export const useWorkspaceStore = defineStore(
  "workspace",
  () => {
    // Exposed as writable ref so AppLayout can sync the list after fetchWorkspaces
    const workspaces = ref<Workspace[]>([]);
    const currentWorkspace = ref<Workspace | null>(null);
    // Unix timestamp (ms) of the last explicit workspace selection.
    // Used to expire the persisted selection after PERSIST_TTL_MS.
    const lastSelectedAt = ref<number | null>(null);
    const loading = ref(false);
    const detailLoading = ref(false);
    const error = ref<string | null>(null);
    const meta = ref<WorkspaceMeta>({
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 0,
    });
    const statuses = ref<WorkspaceStatus[]>([]);
    const statusCounts = ref<Record<string, number>>({});

    // ── Computed aliases ──────────────────────────────────────────────────────
    const activeWorkspace = computed(() => currentWorkspace.value);
    const isLoading = computed(() => loading.value);
    const isDetailLoading = computed(() => detailLoading.value);
    const hasError = computed(() => !!error.value);
    const errorMessage = computed(() => error.value ?? "");

    /**
     * True when the persisted selection is older than PERSIST_TTL_MS.
     * Call this on app boot; if true, clear the selection so the user
     * is not silently dropped into a stale workspace context.
     */
    const isPersistedWorkspaceExpired = computed(() => {
      if (!lastSelectedAt.value) return false;
      return Date.now() - lastSelectedAt.value > PERSIST_TTL_MS;
    });

    // ── Active workspace helpers ──────────────────────────────────────────────

    /**
     * Explicitly select a workspace and stamp the selection time.
     * This is the single place that must be called whenever the user
     * consciously picks a workspace — from the sidebar switcher, URL
     * resolution on mount, etc.
     */
    function setActiveWorkspace(ws: Workspace): void {
      currentWorkspace.value = ws;
      lastSelectedAt.value = Date.now();
    }

    /**
     * Clear the active workspace and its TTL stamp.
     * Called on logout (via auth store's clearPersistedState which wipes the
     * whole "workspace" localStorage key) and on TTL expiry.
     */
    function clearActiveWorkspace(): void {
      currentWorkspace.value = null;
      lastSelectedAt.value = null;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function buildFilterParams(filters?: Record<string, any> | null) {
      return Object.fromEntries(
        Object.entries(filters ?? {}).filter(([, v]) => {
          if (v == null || v === "") return false;
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        }),
      );
    }

    // ── Table / List fetch ────────────────────────────────────────────────────

    async function fetchWorkspaces(
      params: UniversalFetchParams,
    ): Promise<UniversalApiResponse<Workspace>> {
      const { data } = await axios.get<UniversalApiResponse<Workspace>>(
        "/workspaces",
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
      // Sync the local list so AppLayout sidebar switcher is always up to date
      workspaces.value = data.data ?? [];
      return data;
    }

    // ── Kanban board fetch ────────────────────────────────────────────────────

    async function fetchKanbanBoard(
      params: KanbanBoardFetchParams,
    ): Promise<KanbanBoardResponse<Workspace>> {
      const { data } = await axios.get<KanbanBoardResponse<Workspace>>(
        "/workspaces/kanban/board",
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

    // ── Status counts ─────────────────────────────────────────────────────────

    async function fetchStatusCounts(): Promise<void> {
      try {
        const { data } = await axios.get<{ data: Record<string, number> }>(
          "/workspaces/counts",
        );
        statusCounts.value = data.data ?? {};
      } catch (err) {
        console.error("[WorkspaceStore] fetchStatusCounts failed:", err);
      }
    }

    // ── Kanban move / reorder ─────────────────────────────────────────────────

    async function moveCard(event: KanbanMoveEvent<Workspace>): Promise<void> {
      await axios.post("/workspaces/kanban/move", {
        model_id: event.item.id,
        column_id: event.toStage,
      } satisfies KanbanMovePayload);
      fetchStatusCounts();
    }

    async function reorderCards(event: KanbanReorderEvent): Promise<void> {
      await axios.post("/workspaces/kanban/reorder", {
        stage_value: event.stage,
        ordered_ids: event.orderedIds,
      });
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    async function fetchWorkspace(id: number): Promise<Workspace> {
      detailLoading.value = true;
      error.value = null;
      try {
        const { data } = await axios.get<{ data: Workspace }>(
          `/workspaces/${id}`,
        );
        // Use setActiveWorkspace so the TTL stamp is always kept fresh
        setActiveWorkspace(data.data);
        // Also sync the list entry if it exists
        const idx = workspaces.value.findIndex((w) => w.id === id);
        if (idx !== -1) workspaces.value[idx] = data.data;
        return data.data;
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        error.value = e.response?.data?.message ?? "Failed to fetch workspace";
        throw err;
      } finally {
        detailLoading.value = false;
      }
    }

    async function createWorkspace(
      payload: WorkspaceFormData,
    ): Promise<Workspace> {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.post<{ data: Workspace }>(
          "/workspaces",
          payload,
        );
        workspaces.value.unshift(data.data);
        meta.value.total += 1;
        fetchStatusCounts();
        return data.data;
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        error.value = e.response?.data?.message ?? "Failed to create workspace";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function updateWorkspace(
      id: number,
      payload: WorkspaceFormData,
    ): Promise<Workspace> {
      loading.value = true;
      error.value = null;
      try {
        const { data } = await axios.put<{ data: Workspace }>(
          `/workspaces/${id}`,
          payload,
        );
        const idx = workspaces.value.findIndex((w) => w.id === id);
        if (idx !== -1) workspaces.value[idx] = data.data;
        if (currentWorkspace.value?.id === id) setActiveWorkspace(data.data);
        fetchStatusCounts();
        return data.data;
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        error.value = e.response?.data?.message ?? "Failed to update workspace";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function deleteWorkspace(id: number): Promise<void> {
      loading.value = true;
      error.value = null;
      try {
        await axios.delete(`/workspaces/${id}`);
        workspaces.value = workspaces.value.filter((w) => w.id !== id);
        meta.value.total -= 1;
        if (currentWorkspace.value?.id === id) clearActiveWorkspace();
        fetchStatusCounts();
      } catch (err) {
        const e = err as AxiosError<{ message: string }>;
        error.value = e.response?.data?.message ?? "Failed to delete workspace";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // ── Statuses ──────────────────────────────────────────────────────────────

    async function fetchStatuses(): Promise<WorkspaceStatus[]> {
      if (statuses.value.length > 0) return statuses.value;
      try {
        const { data } = await axios.get<{ data: WorkspaceStatus[] }>(
          "/enums/workspace-statuses",
        );
        statuses.value = Array.isArray(data.data) ? data.data : [];
        return statuses.value;
      } catch (err) {
        console.error("[WorkspaceStore] fetchStatuses failed:", err);
        return [];
      }
    }

    function clearError(): void {
      error.value = null;
    }

    function $reset(): void {
      workspaces.value = [];
      clearActiveWorkspace();
      loading.value = false;
      detailLoading.value = false;
      error.value = null;
      statuses.value = [];
      statusCounts.value = {};
      meta.value = { current_page: 1, per_page: 10, total: 0, last_page: 0 };
    }

    return {
      // Expose as writable so AppLayout can directly assign the sidebar list
      workspaces,
      currentWorkspace,
      lastSelectedAt,
      loading,
      detailLoading,
      error,
      meta,
      statuses,
      statusCounts,

      activeWorkspace,
      isLoading,
      isDetailLoading,
      hasError,
      errorMessage,
      isPersistedWorkspaceExpired,

      setActiveWorkspace,
      clearActiveWorkspace,
      fetchWorkspaces,
      fetchKanbanBoard,
      fetchStatusCounts,
      moveCard,
      reorderCards,
      fetchWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      fetchStatuses,
      clearError,
      $reset,
    };
  },
  {
    persist: {
      key: "workspace-store",
      storage: localStorage,
      pick: ["currentWorkspace", "lastSelectedAt"],
    },
  },
);
