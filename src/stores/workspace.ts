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

const PERSIST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const useWorkspaceStore = defineStore(
  "workspace",
  () => {
    const workspaces = ref<Workspace[]>([]);
    const currentWorkspace = ref<Workspace | null>(null);
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

    const activeWorkspace = computed(() => currentWorkspace.value);
    const isLoading = computed(() => loading.value);
    const isDetailLoading = computed(() => detailLoading.value);
    const hasError = computed(() => !!error.value);
    const errorMessage = computed(() => error.value ?? "");

    const isPersistedWorkspaceExpired = computed(() => {
      if (!lastSelectedAt.value) return false;
      return Date.now() - lastSelectedAt.value > PERSIST_TTL_MS;
    });

    function setActiveWorkspace(ws: Workspace): void {
      currentWorkspace.value = ws;
      lastSelectedAt.value = Date.now();
    }

    function clearActiveWorkspace(): void {
      currentWorkspace.value = null;
      lastSelectedAt.value = null;
    }

    function buildFilterParams(filters?: Record<string, any> | null) {
      return Object.fromEntries(
        Object.entries(filters ?? {}).filter(([, v]) => {
          if (v == null || v === "") return false;
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        }),
      );
    }

    // ── fetchWorkspaces ───────────────────────────────────────────────────────
    // CHANGED: wrapped with createRequestCache. Same name, same signature.
    const fetchWorkspaces = createRequestCache(
      async (
        params: UniversalFetchParams,
      ): Promise<UniversalApiResponse<Workspace>> => {
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
        workspaces.value = data.data ?? [];
        return data;
      },
      {
        ttlMs: 30_000,
        swrMs: 10_000,
        maxRetries: 2,
        tags: ["workspaces"],
      },
    );

    // ── fetchKanbanBoard ──────────────────────────────────────────────────────
    // CHANGED: wrapped with createRequestCache. Same name, same signature.
    const fetchKanbanBoard = createRequestCache(
      async (
        params: KanbanBoardFetchParams,
      ): Promise<KanbanBoardResponse<Workspace>> => {
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
      },
      {
        ttlMs: 30_000,
        swrMs: 10_000,
        maxRetries: 2,
        tags: ["workspaces"],
      },
    );

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

    async function fetchWorkspace(id: number): Promise<Workspace> {
      detailLoading.value = true;
      error.value = null;
      try {
        const { data } = await axios.get<{ data: Workspace }>(
          `/workspaces/${id}`,
        );
        setActiveWorkspace(data.data);
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

    // ── createWorkspace ───────────────────────────────────────────────────────
    // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
    const createWorkspace = withCacheInvalidation(
      async (payload: WorkspaceFormData): Promise<Workspace> => {
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
          error.value =
            e.response?.data?.message ?? "Failed to create workspace";
          throw err;
        } finally {
          loading.value = false;
        }
      },
      [fetchWorkspaces, fetchKanbanBoard],
    );

    // ── updateWorkspace ───────────────────────────────────────────────────────
    // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
    const updateWorkspace = withCacheInvalidation(
      async (id: number, payload: WorkspaceFormData): Promise<Workspace> => {
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
          error.value =
            e.response?.data?.message ?? "Failed to update workspace";
          throw err;
        } finally {
          loading.value = false;
        }
      },
      [fetchWorkspaces, fetchKanbanBoard],
    );

    // ── deleteWorkspace ───────────────────────────────────────────────────────
    // CHANGED: wrapped with withCacheInvalidation. Same name, same signature.
    const deleteWorkspace = withCacheInvalidation(
      async (id: number): Promise<void> => {
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
          error.value =
            e.response?.data?.message ?? "Failed to delete workspace";
          throw err;
        } finally {
          loading.value = false;
        }
      },
      [fetchWorkspaces, fetchKanbanBoard],
    );

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
      // Wipe cache so post-logout mount always fetches fresh
      globalCacheRegistry.invalidateTag("workspaces");
    }

    // ── return — IDENTICAL to original ───────────────────────────────────────
    return {
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
