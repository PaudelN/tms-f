import axios from "@/lib/axios";
import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

// Types
export interface Workspace {
  id: number;
  name: string;
  slug: string;
  status: string | null;
  description: string | null;
  is_active: boolean;
  is_archived: boolean;
  extra?: Record<string, unknown> | null;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface WorkspaceListResponse {
  data: Workspace[];
  meta: WorkspaceMeta;
}

export interface WorkspaceDetailResponse {
  data: Workspace;
  formatted: string;
}

export interface WorkspaceFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface WorkspaceFormData {
  name: string;
  description?: string;
  status?: string;
}

export interface WorkspaceStatus {
  value: string;
  label: string;
  description: string;
  dot: string;
  badge: string;
}

export const useWorkspaceStore = defineStore(
  "workspace",
  () => {
    // ============================
    // STATE
    // ============================
    const workspaces = ref<Workspace[]>([]);
    const currentWorkspace = ref<Workspace | null>(null);
    const loading = ref(false);
    const detailLoading = ref(false);
    const error = ref<string | null>(null);
    const meta = ref<WorkspaceMeta>({
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 0,
    });

    //statuses
    const statuses = ref<WorkspaceStatus[]>([]);
    const statusesLoaded = ref(false);

    // Filters state
    const filters = ref<WorkspaceFilters>({
      search: "",
      sortBy: "created_at",
      sortOrder: "desc",
      page: 1,
      perPage: 10,
    });

    // ============================
    // GETTERS
    // ============================
    const isLoading = computed(() => loading.value);
    const isDetailLoading = computed(() => detailLoading.value);
    const hasError = computed(() => error.value !== null);
    const errorMessage = computed(() => error.value);
    const workspaceList = computed(() => workspaces.value);
    const totalWorkspaces = computed(() => meta.value.total);
    const currentPage = computed(() => meta.value.current_page);
    const totalPages = computed(() => meta.value.last_page);
    const perPage = computed(() => meta.value.per_page);
    const activeWorkspace = computed(() => currentWorkspace.value);

    // Get workspace by ID
    const getWorkspaceById = computed(() => {
      return (id: number) => workspaces.value.find((w) => w.id === id);
    });

    // ============================
    // ACTIONS
    // ============================

    /**
     * Fetch all workspaces with optional filters
     */
    async function fetchWorkspaces(customFilters?: Partial<WorkspaceFilters>) {
      loading.value = true;
      error.value = null;

      try {
        // Merge custom filters with stored filters
        const mergedFilters = { ...filters.value, ...customFilters };

        const params = new URLSearchParams();
        if (mergedFilters.search) params.append("search", mergedFilters.search);
        if (mergedFilters.sortBy)
          params.append("sort_by", mergedFilters.sortBy);
        if (mergedFilters.sortOrder)
          params.append("sort_order", mergedFilters.sortOrder);
        if (mergedFilters.page)
          params.append("page", mergedFilters.page.toString());
        if (mergedFilters.perPage)
          params.append("per_page", mergedFilters.perPage.toString());

        const response = await axios.get<WorkspaceListResponse>(
          `/workspaces?${params.toString()}`,
        );

        workspaces.value = response.data.data;
        meta.value = response.data.meta;

        // Update filters state
        filters.value = mergedFilters;

        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        error.value =
          axiosError.response?.data?.message || "Failed to fetch workspaces";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    /**
     * Fetch a single workspace by ID
     */
    async function fetchWorkspace(id: number) {
      detailLoading.value = true;
      error.value = null;

      try {
        const response = await axios.get<WorkspaceDetailResponse>(
          `/workspaces/${id}`,
        );
        currentWorkspace.value = response.data.data;
        return response.data.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        error.value =
          axiosError.response?.data?.message || "Failed to fetch workspace";
        throw err;
      } finally {
        detailLoading.value = false;
      }
    }

    /**
     * Create a new workspace
     */
    async function createWorkspace(data: WorkspaceFormData) {
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.post<WorkspaceDetailResponse>(
          "/workspaces",
          data,
        );

        // Add to local list
        workspaces.value.unshift(response.data.data);
        meta.value.total += 1;

        return response.data.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        error.value =
          axiosError.response?.data?.message || "Failed to create workspace";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    /**
     * Update an existing workspace
     */
    async function updateWorkspace(id: number, data: WorkspaceFormData) {
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.put<WorkspaceDetailResponse>(
          `/workspaces/${id}`,
          data,
        );

        // Update in local list
        const index = workspaces.value.findIndex((w) => w.id === id);
        if (index !== -1) {
          workspaces.value[index] = response.data.data;
        }

        // Update current workspace if it matches
        if (currentWorkspace.value?.id === id) {
          currentWorkspace.value = response.data.data;
        }

        return response.data.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        error.value =
          axiosError.response?.data?.message || "Failed to update workspace";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    /**
     * Delete a workspace
     */
    async function deleteWorkspace(id: number) {
      loading.value = true;
      error.value = null;

      try {
        await axios.delete(`/workspaces/${id}`);

        // Remove from local list
        const index = workspaces.value.findIndex((w) => w.id === id);
        if (index !== -1) {
          workspaces.value.splice(index, 1);
          meta.value.total -= 1;
        }

        // Clear current workspace if it matches
        if (currentWorkspace.value?.id === id) {
          currentWorkspace.value = null;
        }

        return true;
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        error.value =
          axiosError.response?.data?.message || "Failed to delete workspace";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function fetchStatuses() {
      if (statusesLoaded.value) return statuses.value; // cached
      try {
        const response = await axios.get<{ data: WorkspaceStatus[] }>(
          "/enums/workspace-statuses",
        );
        statuses.value = response.data.data;
        statusesLoaded.value = true;
        return statuses.value;
      } catch (err) {
        console.error("Failed to load statuses", err);
        return [];
      }
    }

    /**
     * Update filters and refetch
     */
    async function updateFilters(newFilters: Partial<WorkspaceFilters>) {
      await fetchWorkspaces(newFilters);
    }

    /**
     * Reset filters to defaults
     */
    async function resetFilters() {
      filters.value = {
        search: "",
        sortBy: "created_at",
        sortOrder: "desc",
        page: 1,
        perPage: 10,
      };
      await fetchWorkspaces();
    }

    /**
     * Set current workspace
     */
    function setCurrentWorkspace(workspace: Workspace | null) {
      currentWorkspace.value = workspace;
    }

    /**
     * Clear error
     */
    function clearError() {
      error.value = null;
    }

    /**
     * Clear current workspace
     */
    function clearCurrentWorkspace() {
      currentWorkspace.value = null;
    }

    /**
     * Reset entire store
     */
    function $reset() {
      workspaces.value = [];
      currentWorkspace.value = null;
      loading.value = false;
      detailLoading.value = false;
      error.value = null;
      meta.value = {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 0,
      };
      filters.value = {
        search: "",
        sortBy: "created_at",
        sortOrder: "desc",
        page: 1,
        perPage: 10,
      };
    }

    // ============================
    // RETURN
    // ============================
    return {
      // State
      workspaces,
      currentWorkspace,
      loading,
      detailLoading,
      error,
      meta,
      filters,
      statuses,
      statusesLoaded,

      // Getters
      isLoading,
      isDetailLoading,
      hasError,
      errorMessage,
      workspaceList,
      totalWorkspaces,
      currentPage,
      totalPages,
      perPage,
      activeWorkspace,
      getWorkspaceById,

      // Actions
      fetchWorkspaces,
      fetchWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      updateFilters,
      resetFilters,
      setCurrentWorkspace,
      clearError,
      clearCurrentWorkspace,
      $reset,
      fetchStatuses,
    };
  },
  {
    persist: {
      key: "workspace-store",
      storage: localStorage,
      //   paths: ["workspaces", "currentWorkspace", "filters", "meta"],
    },
  },
);
