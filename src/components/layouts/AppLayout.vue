<script setup lang="ts">
import ModeToggle from "@/components/common/ModeToggle.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { appNavigation } from "@/features/navigation/app-navigation";
import { Bell, Search } from "lucide-vue-next";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const currentNavTitle = computed(() => {
  const current = appNavigation.find((item) => route.path.startsWith(item.href));
  return current?.name ?? "Dashboard";
});
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader class="border-b border-sidebar-border px-3 py-4">
        <div class="flex items-center gap-2 px-2">
          <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">T</div>
          <div class="group-data-[collapsible=icon]:hidden">
            <p class="text-sm font-semibold">Taskification</p>
            <p class="text-xs text-muted-foreground">Track · Plan · Achieve</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in appNavigation" :key="item.href">
                <SidebarMenuButton as-child :is-active="route.path === item.href" :tooltip="item.name">
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

      <SidebarFooter class="border-t border-sidebar-border p-3">
        <p class="text-xs text-muted-foreground">Workspace Portal</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <SidebarTrigger />
        <h1 class="text-sm font-semibold md:text-base">{{ currentNavTitle }}</h1>
        <div class="ml-auto hidden w-full max-w-md md:block">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks, projects, or team members" class="h-9 pl-9" />
          </div>
        </div>
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <Bell class="size-4" />
        </Button>
      </header>

      <main class="min-h-[calc(100svh-3.5rem)] p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
