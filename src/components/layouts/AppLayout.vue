<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, Briefcase, LayoutDashboard, PanelLeft, ReceiptText } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserProfileMenu from '@/components/common/UserProfileMenu.vue'
import ModeToggle from '@/components/common/ModeToggle.vue'
import { UiBreadcrumbs } from '@/components/shared'

const route = useRoute()

const navigation = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Workspace', url: '/workspace', icon: Briefcase },
  { title: 'Projects', url: '/projects', icon: PanelLeft },
  { title: 'Reports', url: '/reports', icon: ReceiptText },
]

const breadcrumbs = computed(() => {
  const active = navigation.find((item) => route.path.startsWith(item.url))
  return [{ label: 'App', to: '/dashboard' }, { label: active?.title ?? 'Overview' }]
})
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" class="border-r border-border/70 bg-sidebar shadow-soft">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigation" :key="item.title">
                <SidebarMenuButton as-child :is-active="route.path.startsWith(item.url)">
                  <router-link :to="item.url" class="flex items-center gap-2">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserProfileMenu :sidebar-collapsed="false" />
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <header class="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-sm">
        <div class="flex h-14 items-center gap-3 px-4 md:px-6">
          <SidebarTrigger />
          <UiBreadcrumbs :items="breadcrumbs" />
          <div class="ml-auto flex items-center gap-2">
            <Input placeholder="Search" class="hidden w-56 lg:block" />
            <Button variant="outline" size="icon"><Bell class="h-4 w-4" /></Button>
            <ModeToggle />
          </div>
        </div>
      </header>
      <main class="min-h-[calc(100vh-56px)] bg-background p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
