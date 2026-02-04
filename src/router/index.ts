import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import AppLayout from "@/components/layouts/AppLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/components/dashboard/Dashboard.vue"),
      },
      {
        path: "users",
        name: "Users",
        component: () => import("@/components/users/UsersList.vue"),
      },
      // Future routes
      // {
      //   path: "workspaces",
      //   name: "Workspaces",
      //   component: () => import("@/components/common/WorkspaceList.vue"),
      // },
      // {
      //   path: "workspaces/:id",
      //   name: "WorkspaceDetail",
      //   component: () => import("@/components/common/WorkspaceDetail.vue"),
      // },
      // {
      //   path: "projects",
      //   name: "Projects",
      //   component: () => import("@/components/common/ProjectsList.vue"),
      // },
      // {
      //   path: "projects/:id",
      //   name: "ProjectDetail",
      //   component: () => import("@/components/common/ProjectDetail.vue"),
      // },
      // {
      //   path: "projects/:id/board",
      //   name: "ProjectBoard",
      //   component: () => import("@/components/common/ProjectBoard.vue"),
      // },
    ],
  },
  // Auth routes (outside layout)
  {
    path: "/login",
    name: "Login",
    component: () => import("@/components/auth/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/components/auth/Register.vue"),
  },
  // 404
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/components/common/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
// router.beforeEach((to, from, next) => {
//    const token = localStorage.getItem("auth_token");
//   const authRequired = !["Login", "Register"].includes(to.name as string);

//   if (authRequired && !token) {
//     next({ name: "Login" });
//   } else if (!authRequired && token) {
//     next({ name: "Dashboard" });
//   } else {
//     next();
//   }
// });

export default router;
