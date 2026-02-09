<script setup lang="ts">
import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Columns3,
  FileText,
  FolderTree,
  GalleryVerticalEnd,
  LayoutDashboard,
  Search,
  Settings,
  Clock,
} from "lucide-vue-next";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Work Space", icon: GalleryVerticalEnd, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Board", icon: Columns3, href: "/pipeline" },
  { name: "Board Stage", icon: GalleryVerticalEnd, href: "/pipeline-stage" },
  { name: "Task", icon: ClipboardList, href: "/tasks" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Timesheets", icon: Clock, href: "/timesheets" },
  { name: "Report", icon: FileText, href: "/report" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

const currentNavTitle = computed(() => {
  const current = navigation.find((item) => item.href === route.path);
  return current ? current.name : "Dashboard";
});

const isActive = (href: string) => route.path === href;
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" class="border-r border-border bg-sidebar">
      <SidebarHeader class="h-14 justify-center px-3">
        <div class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-md bg-linear-to-br from-primary to-primary/80 shadow-sm"
          >
            <span class="text-primary-foreground font-semibold">T</span>
          </div>
          <div class="flex flex-col leading-none">
            <span class="text-sm font-semibold text-sidebar-foreground">Taskification</span>
            <span class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Track Plan</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent class="px-2">
        <SidebarMenu>
          <SidebarMenuItem v-for="item in navigation" :key="item.name">
            <SidebarMenuButton
              as-child
              :is-active="isActive(item.href)"
              :tooltip="item.name"
            >
              <RouterLink :to="item.href" class="flex items-center gap-2">
                <component :is="item.icon" class="h-4 w-4" />
                <span>{{ item.name }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter class="border-t border-border/60">
        <UserProfileMenu />
      </SidebarFooter>
    </Sidebar>

    <SidebarInset class="bg-background">
      <header class="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div class="flex h-14 items-center gap-4 px-4">
          <SidebarTrigger class="md:hidden" />
          <SidebarTrigger class="hidden md:flex" />

          <div class="flex items-center gap-2">
            <h1 class="text-base font-semibold text-foreground">
              {{ currentNavTitle }}
            </h1>
          </div>

          <div class="flex-1" />

          <div class="relative hidden w-72 md:block">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks, projects, or team members..."
              class="pl-9"
            />
          </div>

          <div class="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" class="relative">
              <Bell class="h-5 w-5" />
              <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
            </Button>
          </div>
        </div>
      </header>

      <main class="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
