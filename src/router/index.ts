import AppLayout from "@/components/layouts/AppLayout.vue";
import { useAuthStore } from "@/stores/auth";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  // ── Guest routes ──────────────────────────────────────────────
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/Login.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/Register.vue"),
    meta: { requiresGuest: true },
  },

  // ── Protected routes ──────────────────────────────────────────
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: "/dashboard",
    children: [
      // Dashboard
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/dashboard/Dashboard.vue"),
      },

      // ── Workspaces ─────────────────────────────────────────────
      {
        path: "workspace",
        name: "workspace",
        component: () => import("@/views/workspace/index.vue"),
      },
      {
        path: "workspace/add",
        name: "workspace-add",
        component: () => import("@/views/workspace/add.vue"),
      },
      {
        path: "workspace/:id",
        name: "workspace-detail",
        component: () => import("@/views/workspace/detail.vue"),
      },
      {
        path: "workspace/:id/edit",
        name: "workspace-edit",
        component: () => import("@/views/workspace/edit.vue"),
      },

      // ── Projects ───────────────────────────────────────────────
      //
      // Shallow routing — mirrors the backend apiResource shallow():
      //
      //   NESTED (workspace context required):
      //     index  → /workspace/:workspaceId/projects
      //     add    → /workspace/:workspaceId/projects/add
      //
      //   SHALLOW (only project id needed):
      //     detail → /projects/:id
      //     edit   → /projects/:id/edit
      //
      {
        path: "workspace/:workspaceId/projects",
        name: "project-index",
        component: () => import("@/views/project/index.vue"),
      },
      {
        path: "workspace/:workspaceId/projects/add",
        name: "project-add",
        component: () => import("@/views/project/add.vue"),
      },
      {
        path: "projects/:id",
        name: "project-detail",
        component: () => import("@/views/project/detail.vue"),
      },
      {
        path: "projects/:id/edit",
        name: "project-edit",
        component: () => import("@/views/project/edit.vue"),
      },

      // ── Pipelines ──────────────────────────────────────────────
      //
      // Shallow routing — mirrors backend projects.pipelines shallow():
      //
      // Hierarchy: Workspace → Project → Pipeline → PipelineStage (next)
      //
      //   NESTED (project context required — creation & listing):
      //     index  → /projects/:projectId/pipelines
      //     add    → /projects/:projectId/pipelines/add
      //
      //   SHALLOW (only pipeline id needed):
      //     detail → /pipelines/:id
      //     edit   → /pipelines/:id/edit
      //
      // URL design mirrors the backend:
      //   GET    /projects/{project}/pipelines        → index  (nested)
      //   POST   /projects/{project}/pipelines        → store  (nested)
      //   GET    /pipelines/{pipeline}                → show   (shallow)
      //   POST   /pipelines/{pipeline}/update         → update (shallow, CORS-safe POST)
      //   DELETE /pipelines/{pipeline}                → destroy (shallow)
      //
      // Note: No kanban routes — pipelines use list / table only.
      {
        // Pipeline list scoped to a project
        // projectId from route param → pipelineStore.fetchPipelines({ projectId })
        path: "projects/:projectId/pipelines",
        name: "pipeline-index",
        component: () => import("@/views/pipeline/index.vue"),
      },
      {
        // Create pipeline inside a project
        // projectId from route param → pipelineStore.createPipeline(projectId, payload)
        path: "projects/:projectId/pipelines/add",
        name: "pipeline-add",
        component: () => import("@/views/pipeline/add.vue"),
      },
      {
        // Pipeline detail — shallow, only pipeline id needed
        // pipelineStore.fetchPipeline(id) — project + workspace data returned in pipeline.project
        path: "pipelines/:id",
        name: "pipeline-detail",
        component: () => import("@/views/pipeline/detail.vue"),
      },
      {
        // Edit pipeline — shallow, only pipeline id needed
        // pipelineStore.updatePipeline(id, payload)
        path: "pipelines/:id/edit",
        name: "pipeline-edit",
        component: () => import("@/views/pipeline/edit.vue"),
      },
      // ── Pipeline Stages ────────────────────────────────────────────────────
      //
      // Hierarchy: Workspace → Project → Pipeline → PipelineStage → Task
      //
      // Shallow routing — mirrors backend pipelines.stages shallow():
      //
      //   NESTED (pipeline context required — listing & creation):
      //     index  → /pipelines/:pipelineId/stages
      //     add    → /pipelines/:pipelineId/stages/add
      //
      //   SHALLOW (only stage id needed):
      //     detail → /stages/:id
      //     edit   → /stages/:id/edit
      //
      {
        path: "pipelines/:pipelineId/stages",
        name: "pipeline-stage-index",
        component: () => import("@/views/pipelineStages/index.vue"),
      },
      {
        path: "pipelines/:pipelineId/stages/add",
        name: "pipeline-stage-add",
        component: () => import("@/views/pipelineStages/add.vue"),
      },
      {
        path: "stages/:id",
        name: "pipeline-stage-detail",
        component: () => import("@/views/pipelineStages/detail.vue"),
      },
      {
        path: "stages/:id/edit",
        name: "pipeline-stage-edit",
        component: () => import("@/views/pipelineStages/edit.vue"),
      },
      // Add alongside the existing task routes
      {
        path: "/pipelines/:pipelineId/tasks",
        name: "task-index",
        component: () => import("@/views/task/index.vue"),
      },
      {
        path: "/pipelines/:pipelineId/tasks/add",
        name: "task-add",
        component: () => import("@/views/task/add.vue"),
      },
      {
        path: "/tasks/:id",
        name: "task-detail",
        component: () => import("@/views/task/detail.vue"),
      },
      {
        path: "/tasks/:id/edit",
        name: "task-edit",
        component: () => import("@/views/task/edit.vue"),
      },
    ],
  },

  // ── Utility routes ────────────────────────────────────────────
  {
    path: "/server-error",
    name: "server-error",
    component: () => import("@/components/common/ServerError.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/components/common/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const requiresGuest = to.matched.some((r) => r.meta.requiresGuest);

  if (requiresAuth && !authStore.isLoggedIn) return next({ name: "login" });
  if (requiresGuest && authStore.isLoggedIn) return next({ name: "dashboard" });
  return next();
});

export default router;
