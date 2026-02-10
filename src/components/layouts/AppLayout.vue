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
import { Bell, FolderKanban, LayoutDashboard, Search, Workflow } from "lucide-vue-next";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const route = useRoute();

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workspace", href: "/workspace", icon: FolderKanban },
  { name: "Board", href: "/pipeline", icon: Workflow },
];

const currentNavTitle = computed(() => {
  const current = navigation.find((item) => route.path.startsWith(item.href));
  return current?.name ?? "Dashboard";
});
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader class="h-14 border-b border-sidebar-border px-3">
        <div class="flex items-center gap-2">
          <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            T
          </div>
          <div class="group-data-[collapsible=icon]:hidden">
            <p class="text-sm font-semibold">Taskification</p>
            <p class="text-xs text-sidebar-foreground/70">Track · Plan · Achieve</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigation" :key="item.href">
                <SidebarMenuButton as-child :tooltip="item.name" :is-active="route.path.startsWith(item.href)">
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

      <SidebarFooter class="border-t border-sidebar-border p-0">
        <UserProfileMenu :sidebar-collapsed="false" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <SidebarTrigger />
        <h1 class="text-sm font-semibold md:text-base">{{ currentNavTitle }}</h1>

        <div class="ml-auto flex items-center gap-2">
          <div class="relative hidden w-72 md:block">
            <Search class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks and workspaces" class="h-9 pl-8" />
          </div>
          <ModeToggle />
          <Button variant="ghost" size="icon">
            <Bell class="size-4" />
          </Button>
        </div>
      </header>

      <main class="min-h-[calc(100svh-3.5rem)] p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
