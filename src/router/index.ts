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
      // Shallow routing — mirrors the backend:
      //
      //   NESTED (workspace context required):
      //     index  → /workspace/:workspaceId/projects
      //     add    → /workspace/:workspaceId/projects/add
      //
      //   SHALLOW (only project id needed):
      //     detail → /projects/:id
      //     edit   → /projects/:id/edit
      //
      // This matches:
      //   GET    /workspaces/{workspace}/projects   → index  (nested)
      //   POST   /workspaces/{workspace}/projects   → store  (nested)
      //   GET    /projects/{project}                → show   (shallow)
      //   PATCH  /projects/{project}                → update (shallow)
      //   DELETE /projects/{project}                → destroy (shallow)
      {
        // Project list scoped to a workspace (table / list / kanban)
        // workspaceId is passed as route param — projectStore.fetchProjects({ workspaceId })
        path: "workspace/:workspaceId/projects",
        name: "project-index",
        component: () => import("@/views/project/index.vue"),
      },
      {
        // Create project inside a workspace
        // workspaceId from route param → projectStore.createProject(workspaceId, payload)
        path: "workspace/:workspaceId/projects/add",
        name: "project-add",
        component: () => import("@/views/project/add.vue"),
      },
      {
        // Project detail — shallow, only project id needed
        // projectStore.fetchProject(id) — workspace data returned in project.workspace
        path: "projects/:id",
        name: "project-detail",
        component: () => import("@/views/project/detail.vue"),
      },
      {
        // Edit project — shallow, only project id needed
        // projectStore.updateProject(id, payload)
        path: "projects/:id/edit",
        name: "project-edit",
        component: () => import("@/views/project/edit.vue"),
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
