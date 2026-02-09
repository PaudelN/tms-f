<script setup lang="ts">
import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  GalleryHorizontalEnd,
  GalleryVerticalEnd,
  LayoutDashboard,
  Search,
  Wrench,
} from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Work Space", icon: GalleryVerticalEnd, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Board", icon: Columns3, href: "/pipeline" },
  {
    name: "Board Stage",
    icon: GalleryHorizontalEnd,
    href: "/pipeline-stage",
  },
  { name: "Task", icon: ClipboardList, href: "/tasks" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Timesheets", icon: Clock, href: "/timesheets" },
  { name: "Report", icon: FileText, href: "/report" },
  { name: "Settings", icon: Wrench, href: "/settings" },
];

const currentNavTitle = computed(() => {
  const current = navigation.find((item) => item.href === route.path);
  return current ? current.name : "Dashboard";
});

const isActive = (href: string) => route.path === href;
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="inset" collapsible="icon" class="border-r border-border/60">
      <SidebarHeader class="px-4 py-4">
        <div class="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div
            class="flex items-center justify-center w-9 h-9 rounded-md bg-linear-to-br from-primary to-primary/80 shadow-md"
          >
            <span class="text-foreground font-bold text-lg tracking-tight">T</span>
          </div>
          <div class="flex flex-col group-data-[collapsible=icon]:hidden">
            <span class="text-base font-semibold tracking-tight leading-none">
              Taskification
            </span>
            <span
              class="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5"
            >
              Track Plan Achieve
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent class="px-2">
        <SidebarMenu>
          <SidebarMenuItem
            v-for="item in navigation"
            :key="item.name"
          >
            <SidebarMenuButton
              as-child
              :is-active="isActive(item.href)"
              :tooltip="item.name"
            >
              <router-link
                :to="item.href"
                class="flex items-center gap-3"
              >
                <component :is="item.icon" class="h-4 w-4" />
                <span class="truncate">{{ item.name }}</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter class="p-0">
        <UserProfileMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-40 bg-card/95 backdrop-blur-md supports-backdrop-filter:bg-card/95 shadow-sm"
      >
        <div class="flex h-14 items-center gap-3 px-6">
          <SidebarTrigger class="shrink-0" />

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

      <main class="p-6 min-h-[calc(100vh-3.5rem)]">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
