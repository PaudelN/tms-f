import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('@/views/dashboard/index.vue') },
      { path: 'projects', component: () => import('@/views/projects/index.vue') },
      { path: 'projects/:id', component: () => import('@/views/projects/[id].vue') },
      { path: 'tasks', component: () => import('@/views/tasks/index.vue') },
      { path: 'settings/profile', component: () => import('@/views/settings/profile.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/common/NotFound.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
