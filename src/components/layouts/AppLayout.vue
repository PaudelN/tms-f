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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Clock,
  ClipboardList,
  FileText,
  FolderTree,
  Layers,
  LayoutDashboard,
  ListOrdered,
  Plus,
  Search,
  Settings,
} from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Work Space", icon: Layers, href: "/workspace" },
  { name: "Project", icon: FolderTree, href: "/projects" },
  { name: "Board", icon: ListOrdered, href: "/pipeline" },
  { name: "Board Stage", icon: ListOrdered, href: "/pipeline-stage" },
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

</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" class="border-r border-border/60">
      <SidebarHeader class="px-4 py-4">
        <div class="flex items-center gap-3">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-md bg-linear-to-br from-primary to-primary/80 shadow-md"
          >
            <span class="text-foreground font-bold text-lg tracking-tight">T</span>
          </div>
          <div class="flex flex-col leading-none">
            <span class="text-base font-semibold tracking-tight text-foreground">
              Taskification
            </span>
            <span class="text-[10px] font-medium text-muted-foreground uppercase">
              Track Plan Achieve
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent class="px-2">
        <SidebarMenu>
          <SidebarMenuItem v-for="item in navigation" :key="item.name">
            <SidebarMenuButton
              as-child
              :is-active="route.path === item.href"
              :tooltip="item.name"
            >
              <router-link :to="item.href" class="flex items-center gap-2">
                <component :is="item.icon" class="h-4 w-4" />
                <span>{{ item.name }}</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter class="p-0">
        <UserProfileMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur-md"
      >
        <div class="flex h-14 items-center gap-4 px-6">
          <SidebarTrigger class="md:hidden" />
          <SidebarTrigger class="hidden md:flex" />

          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-foreground tracking-tight">
              {{ currentNavTitle }}
            </h1>
          </div>

          <div class="flex-1" />

          <div class="relative hidden w-80 md:block">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks, projects, or team members..."
              class="pl-9 h-10 bg-background/50"
            />
          </div>

          <div class="flex items-center gap-2">
            <ModeToggle />
          </div>

          <div class="hidden md:flex items-center gap-3 pl-4 ml-4 border-l">
            <div class="text-right">
              <p class="text-sm font-semibold text-foreground leading-none">
                Quick Log
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                Task - Notes - Logs
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Plus class="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main class="p-6 min-h-[calc(100vh-4rem)]">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
