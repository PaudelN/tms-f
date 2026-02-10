<script setup lang="ts">
import { computed } from "vue";
import { Bell, LayoutDashboard, GalleryVerticalEnd, FolderTree, Columns3, ListChecks, ChartColumn, Clock3, FileText, Settings, Plus, Search } from "lucide-vue-next";
import { useRoute } from "vue-router";
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

const route = useRoute();

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Work Space", icon: GalleryVerticalEnd, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Board", icon: Columns3, href: "/pipeline" },
  { name: "Board Stage", icon: Columns3, href: "/pipeline-stage" },
  { name: "Task", icon: ListChecks, href: "/tasks" },
  { name: "Analytics", icon: ChartColumn, href: "/analytics" },
  { name: "Timesheets", icon: Clock3, href: "/timesheets" },
  { name: "Report", icon: FileText, href: "/report" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

const currentNavTitle = computed(() => navigation.find((item) => item.href === route.path)?.name ?? "Dashboard");
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader class="h-14 border-b px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" class="h-9">
              <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">T</div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Taskification</span>
                <span class="truncate text-xs text-muted-foreground">Track Plan Achieve</span>
              </div>
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
                <SidebarMenuButton as-child :is-active="route.path === item.href" :tooltip="item.name">
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

      <SidebarFooter>
        <UserProfileMenu :sidebar-collapsed="false" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <SidebarTrigger class="md:flex" />

        <h1 class="text-base font-semibold">{{ currentNavTitle }}</h1>

        <div class="relative ml-auto hidden w-full max-w-sm md:block">
          <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input class="pl-9" placeholder="Search tasks, projects, or people" />
        </div>

        <ModeToggle />

        <Button variant="ghost" size="icon" class="relative">
          <Bell class="size-5" />
          <span class="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </Button>

        <Button variant="outline" size="sm" class="hidden gap-2 md:inline-flex">
          <Plus class="size-4" />
          Quick log
        </Button>
      </header>

      <main class="min-h-[calc(100vh-3.5rem)] p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
