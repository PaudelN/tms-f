import AppLayout from '@/components/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: '/dashboard', name: 'dashboard', component: () => import('@/views/dashboard/index.vue') },
      { path: '/workspace', name: 'workspace', component: () => import('@/views/workspace/index.vue') },
      { path: '/workspace/add', name: 'workspace-add', component: () => import('@/views/workspace/add.vue') },
      { path: '/workspace/:id', name: 'workspace-detail', component: () => import('@/views/workspace/detail.vue') },
      { path: '/workspace/:id/edit', name: 'workspace-edit', component: () => import('@/views/workspace/edit.vue') },
      { path: '/projects', name: 'projects', component: () => import('@/views/projects/index.vue') },
      { path: '/projects/:id', name: 'project-detail', component: () => import('@/views/projects/[id].vue') },
      { path: '/tasks', name: 'tasks', component: () => import('@/views/tasks/index.vue') },
      { path: '/settings/profile', name: 'settings-profile', component: () => import('@/views/settings/profile.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/components/common/NotFound.vue') },
  { path: '/server-error', name: 'server-error', component: () => import('@/components/common/ServerError.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isLoggedIn) next({ name: 'login' })
  else if (to.matched.some((record) => record.meta.requiresGuest) && authStore.isLoggedIn) next({ name: 'dashboard' })
  else next()
})

export default router
