<script setup lang="ts">
import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
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
  BarChart3,
  Bell,
  ClipboardList,
  Clock,
  Columns3,
  FileText,
  FolderTree,
  GalleryVerticalEnd,
  LayoutDashboard,
  Search,
  Wrench,
} from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const primaryNavigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Work Space", icon: GalleryVerticalEnd, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Task", icon: ClipboardList, href: "/tasks" },
  { name: "Board", icon: Columns3, href: "/pipeline" },
];

const insightNavigation = [
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Timesheets", icon: Clock, href: "/timesheets" },
  { name: "Report", icon: FileText, href: "/report" },
  { name: "Settings", icon: Wrench, href: "/settings" },
];

const currentNavTitle = computed(() => {
  const combined = [...primaryNavigation, ...insightNavigation];
  const current = combined.find((item) => item.href === route.path);
  return current ? current.name : "Dashboard";
});

const isActive = (href: string) => route.path === href;
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" class="gap-3">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <GalleryVerticalEnd class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Taskification</span>
                <span class="truncate text-xs text-muted-foreground">
                  Track Plan Achieve
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in primaryNavigation" :key="item.name">
                <SidebarMenuButton as-child :is-active="isActive(item.href)">
                  <router-link :to="item.href">
                    <component :is="item.icon" />
                    <span>{{ item.name }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in insightNavigation" :key="item.name">
                <SidebarMenuButton as-child :is-active="isActive(item.href)">
                  <router-link :to="item.href">
                    <component :is="item.icon" />
                    <span>{{ item.name }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="p-0">
        <UserProfileMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex flex-1 items-center gap-3 px-4">
          <SidebarTrigger class="-ml-1" />

          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-foreground tracking-tight">
              {{ currentNavTitle }}
            </h1>
          </div>

          <div class="flex-1" />

          <div class="relative w-80 hidden md:block">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Search tasks, projects, or team members..."
              class="pl-10 h-10 bg-background/50 border-border/50 focus:bg-background"
            />
          </div>

          <div class="flex items-center gap-2">
            <ModeToggle />

            <Button variant="ghost" size="icon" class="relative">
              <Bell class="h-5 w-5" />
              <span
                class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-1 ring-card"
              />
            </Button>
          </div>
        </div>
      </header>

      <main class="p-6 min-h-[calc(100vh-4rem)]">
        <router-view />
      </main>
      <Toaster />
    </SidebarInset>
  </SidebarProvider>
</template>
