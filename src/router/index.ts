import AppLayout from "@/components/layouts/AppLayout.vue";
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
        component: () => import("@/views/workspace/Workspace.vue"),
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

router.beforeEach((to, from, next) => {
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
