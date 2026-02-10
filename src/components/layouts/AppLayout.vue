<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { FolderKanban, LayoutDashboard, LineChart } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { title: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', to: '/projects', icon: FolderKanban },
  { title: 'Analytics', to: '/analytics', icon: LineChart },
  { title: 'Workspace', to: '/workspace', icon: FolderKanban },
]

const title = computed(() => navItems.find((item) => route.path.startsWith(item.to))?.title ?? 'Dashboard')
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Taskification</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navItems" :key="item.to">
                <SidebarMenuButton as-child :is-active="route.path.startsWith(item.to)">
                  <router-link :to="item.to">
                    <component :is="item.icon" class="size-4" />
                    <span>{{ item.title }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-sm">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{{ title }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main class="p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
