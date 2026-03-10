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
      // Matches your existing API: GET|POST /workspaces, GET|PUT|DELETE /workspaces/:id
      {
        // List of all user workspaces (table / list / kanban view)
        // Calls: workspaceStore.fetchWorkspaces() / fetchKanbanBoard()
        path: "workspace",
        name: "workspace",
        component: () => import("@/views/workspace/index.vue"),
      },
      {
        // Create workspace form
        // Calls: workspaceStore.createWorkspace(payload) → redirect to workspace-detail
        path: "workspace/add",
        name: "workspace-add",
        component: () => import("@/views/workspace/add.vue"),
      },
      {
        // Workspace detail — shows overview, projects tab, members tab
        // Calls: workspaceStore.fetchWorkspace(id) — already done by layout watcher
        path: "workspace/:id",
        name: "workspace-detail",
        component: () => import("@/views/workspace/detail.vue"),
      },
      {
        // Edit workspace form
        // Calls: workspaceStore.updateWorkspace(id, payload) on submit
        //        workspaceStore.deleteWorkspace(id) on delete → redirect to workspace
        path: "workspace/:id/edit",
        name: "workspace-edit",
        component: () => import("@/views/workspace/edit.vue"),
      },

      // ── Projects (nested under workspace) ──────────────────────
      // These are STUBS — create these views after projectStore is built.
      // Backend routes will be: GET|POST /workspaces/:workspaceId/projects
      //                         GET|PUT|DELETE /projects/:id
      // {
      //   // Project list for a workspace (shown in workspace detail page as a tab,
      //   // but also accessible as its own route for direct linking)
      //   path: "workspace/:workspaceId/projects",
      //   name: "project-index",
      //   component: () => import("@/views/project/index.vue"),
      // },
      // {
      //   // Create project inside a workspace
      //   // Triggered by sidebar "+" button when a workspace is active
      //   path: "workspace/:workspaceId/projects/add",
      //   name: "project-add",
      //   component: () => import("@/views/project/add.vue"),
      // },
      // {
      //   // Project detail — tasks, kanban board, pipelines
      //   // Main landing page after clicking a project in sidebar
      //   path: "workspace/:workspaceId/projects/:id",
      //   name: "project-detail",
      //   component: () => import("@/views/project/detail.vue"),
      // },
      // {
      //   // Edit project settings
      //   // Triggered by sidebar "···" hover button on a project row
      //   path: "workspace/:workspaceId/projects/:id/edit",
      //   name: "project-edit",
      //   component: () => import("@/views/project/edit.vue"),
      // },

      // // ── Workspace-level pages ───────────────────────────────────
      // {
      //   path: "tasks",
      //   name: "tasks",
      //   component: () => import("@/views/tasks/index.vue"),
      // },
      // {
      //   path: "timesheets",
      //   name: "timesheets",
      //   component: () => import("@/views/timesheets/index.vue"),
      // },
      // {
      //   path: "analytics",
      //   name: "analytics",
      //   component: () => import("@/views/analytics/index.vue"),
      // },
      // {
      //   path: "reports",
      //   name: "reports",
      //   component: () => import("@/views/reports/index.vue"),
      // },
      // {
      //   path: "settings",
      //   name: "settings",
      //   component: () => import("@/views/settings/index.vue"),
      // },
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
