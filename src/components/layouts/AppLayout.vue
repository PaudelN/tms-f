<script setup lang="ts">
import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Bell,
  Briefcase,
  ChartColumn,
  ClipboardList,
  Clock3,
  FolderTree,
  Gauge,
  LayoutDashboard,
  Search,
  Settings,
  Sheet,
  Workflow,
} from "lucide-vue-next";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

type NavItem = { name: string; href: string; icon: any };

const navigation: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Workspace", icon: Briefcase, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Board", icon: ChartColumn, href: "/pipeline" },
  { name: "Board Stage", icon: Workflow, href: "/pipeline-stage" },
  { name: "Task", icon: ClipboardList, href: "/tasks" },
  { name: "Analytics", icon: Sheet, href: "/analytics" },
  { name: "Timesheets", icon: Clock3, href: "/timesheets" },
  { name: "Report", icon: Gauge, href: "/report" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

const currentNavTitle = computed(() => {
  return navigation.find((item) => route.path === item.href)?.name ?? "Dashboard";
});

const isActive = (href: string) => route.path === href;
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader class="h-14 border-b border-sidebar-border px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <RouterLink to="/dashboard">
                <div class="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  T
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">Taskification</span>
                  <span class="truncate text-xs text-sidebar-foreground/70">Track • Plan • Achieve</span>
                </div>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigation" :key="item.href">
                <SidebarMenuButton as-child :is-active="isActive(item.href)" :tooltip="item.name">
                  <RouterLink :to="item.href">
                    <component :is="item.icon" />
                    <span>{{ item.name }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="border-t border-sidebar-border">
        <UserProfileMenu :sidebar-collapsed="false" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div class="flex h-14 items-center gap-3 px-4 md:px-6">
          <SidebarTrigger />
          <h1 class="text-base font-semibold text-foreground">{{ currentNavTitle }}</h1>

          <div class="ml-auto flex items-center gap-2">
            <div class="relative hidden w-72 md:block">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tasks, projects, members..." class="pl-9" />
            </div>
            <ModeToggle />
            <Button variant="ghost" size="icon" class="relative">
              <Bell class="h-4 w-4" />
              <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </div>
      </header>

      <main class="min-h-[calc(100vh-56px)] p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
