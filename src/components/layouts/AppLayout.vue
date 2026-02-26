<script setup lang="ts">
  import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Button } from "@/components/ui/button";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Clock,
  Columns3,
  Component,
  Earth,
  FileText,
  FolderTree,
  GalleryHorizontalEnd,
  GalleryVerticalEnd,
  Grab,
  LayoutDashboard,
  PhilippinePeso,
  Sprout,
  Subscript,
  Wrench
} from "lucide-vue-next";
import { ComboboxArrow } from "reka-ui";
import { useRoute } from "vue-router";

  const route = useRoute();

  const navigation = [
    { name: "Work Space", icon: GalleryVerticalEnd, href: "/workspace" },
    { name: "Project", icon: FolderTree, href: "/projects" },
    { name: "Task", icon: ClipboardList, href: "/tasks" },
    { name: "Board", icon: Columns3, href: "/pipeline" },
    {
      name: "Board Stage",
      icon: GalleryHorizontalEnd,
      href: "/pipeline-stage",
    },
  ];

  const analytics = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Analytics", icon: BarChart3, href: "/analytics" },
    { name: "Timesheets", icon: Clock, href: "/timesheets" },
    { name: "Report", icon: FileText, href: "/report" },
    { name: "Settings", icon: Wrench, href: "/settings" },
  ];

  const isActive = (href: string) => route.path === href;
</script>

<template>
  <SidebarProvider>
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <PhilippinePeso class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Taskification</span>
                <span class="truncate text-xs text-muted-foreground"
                  >Track Plan Achieve</span
                >
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <!-- Navigation Section -->
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigation" :key="item.name">
                <SidebarMenuButton
                  as-child
                  :is-active="isActive(item.href)"
                  :tooltip="item.name"
                >
                  <router-link :to="item.href" class="flex items-center gap-3">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span class="truncate">{{ item.name }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <!-- Analytics Section -->
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in analytics" :key="item.name">
                <SidebarMenuButton
                  as-child
                  :is-active="isActive(item.href)"
                  :tooltip="item.name"
                >
                  <router-link :to="item.href" class="flex items-center gap-3">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span class="truncate">{{ item.name }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserProfileMenu />
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-40 backdrop-blur-md supports-backdrop-filter:bg-card/95 shadow-md"
      >
        <div
          class="flex h-16 items-center gap-3 px-2 transition-[height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
          <SidebarTrigger />

          <div class="flex-1" />

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

      <main class="min-h-[calc(100vh-3rem)]">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
