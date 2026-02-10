<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { LayoutDashboardIcon, BriefcaseBusinessIcon, UsersIcon, BarChart3Icon } from "lucide-vue-next";

const route = useRoute();
const nav = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Workspace", to: "/workspace", icon: BriefcaseBusinessIcon },
  { title: "Clients", to: "/clients", icon: UsersIcon },
  { title: "Reports", to: "/reports", icon: BarChart3Icon },
];

const crumbs = computed(() => route.path.split("/").filter(Boolean));
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader class="border-b border-border p-4">
        <p class="text-base font-semibold">Taskification</p>
        <p class="text-xs text-muted-foreground">Enterprise workspace control</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in nav" :key="item.to">
            <SidebarMenuButton :is-active="route.path === item.to" as-child tooltip="item.title">
              <router-link :to="item.to" class="gap-2">
                <component :is="item.icon" class="h-4 w-4" />
                <span>{{ item.title }}</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
    <SidebarInset>
      <header class="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div class="flex items-center gap-3">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbPage>Home</BreadcrumbPage></BreadcrumbItem>
              <template v-for="crumb in crumbs" :key="crumb">
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{{ crumb }}</BreadcrumbPage></BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main class="min-h-[calc(100vh-57px)] p-4 md:p-6"><router-view /></main>
    </SidebarInset>
  </SidebarProvider>
</template>
