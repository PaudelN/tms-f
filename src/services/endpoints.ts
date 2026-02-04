export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },

  // Users
  USERS: {
    BASE: "/users",
    SHOW: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    RESTORE: (id: number) => `/users/${id}/restore`,
    FORCE_DELETE: (id: number) => `/users/${id}/force`,
  },

  // Future: Workspaces
  WORKSPACES: {
    BASE: "/workspaces",
    SHOW: (id: number) => `/workspaces/${id}`,
    UPDATE: (id: number) => `/workspaces/${id}`,
    DELETE: (id: number) => `/workspaces/${id}`,
    MEMBERS: (id: number) => `/workspaces/${id}/members`,
    INVITE: (id: number) => `/workspaces/${id}/invite`,
  },

  // Future: Projects
  PROJECTS: {
    BASE: "/projects",
    SHOW: (id: number) => `/projects/${id}`,
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
    BY_WORKSPACE: (workspaceId: number) =>
      `/workspaces/${workspaceId}/projects`,
  },

  // Future: Pipelines
  PIPELINES: {
    BASE: "/pipelines",
    SHOW: (id: number) => `/pipelines/${id}`,
    UPDATE: (id: number) => `/pipelines/${id}`,
    DELETE: (id: number) => `/pipelines/${id}`,
    BY_PROJECT: (projectId: number) => `/projects/${projectId}/pipelines`,
    REORDER: (id: number) => `/pipelines/${id}/reorder`,
  },

  // Future: Pipeline Stages
  PIPELINE_STAGES: {
    BASE: "/pipeline-stages",
    SHOW: (id: number) => `/pipeline-stages/${id}`,
    UPDATE: (id: number) => `/pipeline-stages/${id}`,
    DELETE: (id: number) => `/pipeline-stages/${id}`,
    BY_PIPELINE: (pipelineId: number) => `/pipelines/${pipelineId}/stages`,
    REORDER: (id: number) => `/pipeline-stages/${id}/reorder`,
  },

  // Future: Tasks
  TASKS: {
    BASE: "/tasks",
    SHOW: (id: number) => `/tasks/${id}`,
    UPDATE: (id: number) => `/tasks/${id}`,
    DELETE: (id: number) => `/tasks/${id}`,
    BY_STAGE: (stageId: number) => `/pipeline-stages/${stageId}/tasks`,
    BY_PROJECT: (projectId: number) => `/projects/${projectId}/tasks`,
    ASSIGN: (id: number) => `/tasks/${id}/assign`,
    MOVE: (id: number) => `/tasks/${id}/move`,
    REORDER: (id: number) => `/tasks/${id}/reorder`,
  },
} as const;
