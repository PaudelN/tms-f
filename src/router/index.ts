import AppLayout from "@/components/layouts/AppLayout.vue";
import WorkspaceLayout from "@/components/layouts/WorkspaceLayout.vue";
import { useAuthStore } from "@/stores/auth";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  // Guest routes
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

  // Protected routes
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/dashboard/Dashboard.vue"),
      },
      {
        path: "/workspace",
        name: "workspace",
        component: () => import("@/views/workspace/index.vue"),
      },
      {
        path: "/workspace/add",
        name: "workspace-add",
        component: () => import("@/views/workspace/add.vue"),
      },

      // Legacy detail route redirect -> new plural nested workspace route structure.
      {
        path: "/workspace/:id",
        redirect: (to) => ({ name: "workspace-overview", params: { id: to.params.id } }),
      },
      {
        path: "/workspace/:id/edit",
        name: "workspace-edit",
        component: () => import("@/views/workspace/edit.vue"),
      },

      // Workspace detail layout with nested section routes.
      {
        path: "/workspaces/:id",
        name: "workspace-detail",
        component: WorkspaceLayout,
        children: [
          {
            path: "",
            redirect: { name: "workspace-overview" },
          },
          {
            path: "overview",
            name: "workspace-overview",
            component: () => import("@/views/workspace/sections/Overview.vue"),
          },
          {
            path: "work",
            name: "workspace-work",
            component: () => import("@/views/workspace/sections/Work.vue"),
          },
          {
            path: "activity",
            name: "workspace-activity",
            component: () => import("@/views/workspace/sections/Activity.vue"),
          },
          {
            path: "files",
            name: "workspace-files",
            component: () => import("@/views/workspace/sections/Files.vue"),
          },
          {
            path: "members",
            name: "workspace-members",
            component: () => import("@/views/workspace/sections/Members.vue"),
          },
          {
            path: "analytics",
            name: "workspace-analytics",
            component: () => import("@/views/workspace/sections/Analytics.vue"),
          },
          {
            path: "settings",
            name: "workspace-settings",
            component: () => import("@/views/workspace/sections/Settings.vue"),
          },
          {
            path: "access",
            name: "workspace-access",
            component: () => import("@/views/workspace/sections/Access.vue"),
          },
        ],
      },
    ],
  },

  // Catch-all 404
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/components/common/NotFound.vue"),
  },
  {
    path: "/server-error",
    name: "server-error",
    component: () => import("@/components/common/ServerError.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (
    to.matched.some((recored) => recored.meta.requiresAuth) &&
    !authStore.isLoggedIn
  )
    next({ name: "login" });
  else if (
    to.matched.some((recored) => recored.meta.requiresGuest) &&
    authStore.isLoggedIn
  )
    next({ name: "dashboard" });
  else next();
});

export default router;
