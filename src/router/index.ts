import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/auth/Login.vue'), meta: { requiresGuest: true } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/Register.vue'), meta: { requiresGuest: true } },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: '/dashboard', name: 'dashboard', component: () => import('@/views/dashboard/Dashboard.vue') },
      { path: '/workspace', name: 'workspace', component: () => import('@/views/workspace/index.vue') },
      { path: '/workspace/add', name: 'workspace-add', component: () => import('@/views/workspace/add.vue') },
      { path: '/workspace/:id', name: 'workspace-detail', component: () => import('@/views/workspace/detail.vue'), props: true },
      { path: '/workspace/:id/edit', name: 'workspace-edit', component: () => import('@/views/workspace/edit.vue'), props: true },
      { path: '/projects', name: 'projects', component: () => import('@/views/projects/index.vue') },
      { path: '/reports', name: 'reports', component: () => import('@/views/reports/index.vue') },
    ],
  },
  { path: '/server-error', name: 'server-error', component: () => import('@/components/common/ServerError.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/components/common/NotFound.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isLoggedIn) {
    next({ name: 'login' })
    return
  }

  if (to.matched.some((record) => record.meta.requiresGuest) && authStore.isLoggedIn) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
