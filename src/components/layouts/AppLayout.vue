<script setup lang="ts">
  import ModeToggle from "@/components/common/ModeToggle.vue";
import UserProfileMenu from "@/components/common/UserProfileMenu.vue";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
  // import { ClipboardIcon } from "@heroicons/vue/16/solid";
  import {
  Bars3Icon,
  BellIcon,
  // ClockIcon,
  // DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

  const route = useRoute();
  const sidebarOpen = ref(false);
  const sidebarCollapsed = ref(false);

  const navigation = [
    { name: "Dashboard", icon: "lucide:layout-dashboard", href: "/" },
    { name: "Work Space", icon: "lucide:gallery-vertical", href: "/workspace" },
    { name: "Project", icon: "lucide:folder-tree", href: "/projects" },
    { name: "Board", icon: "lucide:columns-3", href: "/pipeline" },
    {
      name: "Board Stage",
      icon: "lucide:gallery-horizontal-end",
      href: "/pipeline-stage",
    },
    { name: "Task", icon: "lucide:clipboard-list", href: "/tasks" },
    { name: "Analytics", icon: "lucide:bar-chart-3", href: "/analytics" },
    { name: "Timesheets", icon: "lucide:clock", href: "/timesheets" },
    { name: "Report", icon: "lucide:file-text", href: "/report" },
    { name: "Settings", icon: "lucide:wrench", href: "/settings" },
  ];
  const currentNavTitle = computed(() => {
    const current = navigation.find((item) => item.href === route.path);
    return current ? current.name : "Dashboard";
  });

  const profileOpen = ref(false);

  const toggleProfile = () => {
    profileOpen.value = !profileOpen.value;
  };

  const closeProfile = () => {
    profileOpen.value = false;
  };

  const isActive = (href: string) => route.path === href;

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Desktop Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 hidden lg:block transition-all duration-300 ease-in-out bg-card shadow-sm',
        sidebarCollapsed ? 'w-18' : 'w-64',
      ]"
    >
      <!-- Logo Header -->
      <div
        class="flex items-center h-14 transition-all duration-300"
        :class="sidebarCollapsed ? 'px-4 justify-center' : 'px-6'"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-br from-primary to-primary/80 shadow-md"
          >
            <span class="text-foreground font-bold text-lg tracking-tight"
              >T</span
            >
          </div>
          <div v-if="!sidebarCollapsed" class="flex flex-col">
            <span
              class="text-base font-semibold tracking-tight leading-none text-foreground"
            >
              TaskFlow
            </span>
            <span
              class="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5"
            >
              Track Plan Achieve
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
            sidebarCollapsed ? 'justify-center' : '',
            isActive(item.href)
              ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-2 border-transparent',
          ]"
          :title="sidebarCollapsed ? item.name : ''"
        >
          <Icon
            :icon="item.icon"
            :class="[
              'h-5 w-5 shrink-0 transition-all duration-200',
              isActive(item.href)
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-foreground',
            ]"
          />
          <span v-if="!sidebarCollapsed" class="transition-colors duration-200">
            {{ item.name }}
          </span>
        </router-link>
      </nav>

      <!-- User Profile Section -->
<div
  ref="menuRef"
  class="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-card/70 backdrop-blur"
>

        <UserProfileMenu :sidebarCollapsed="sidebarCollapsed" />
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      :class="[
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64',
      ]"
    >
      <!-- Header -->
      <header
        class="sticky top-0 z-40 bg-card/95 backdrop-blur-md supports-backdrop-filter:bg-card/95 shadow-md"
      >
        <div class="flex h-14 items-center gap-4 px-6">
          <!-- Mobile menu button -->
          <Button
            variant="ghost"
            size="icon"
            class="lg:hidden"
            @click="sidebarOpen = !sidebarOpen"
          >
            <Bars3Icon class="h-5 w-5" />
          </Button>

          <!-- Desktop sidebar toggle -->
          <Button
            variant="ghost"
            size="icon"
            class="hidden lg:flex"
            @click="toggleSidebar"
          >
            <Bars3Icon class="h-5 w-5" />
          </Button>

          <!-- Page Title -->
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-semibold text-foreground tracking-tight">
              {{ currentNavTitle }}
            </h1>
          </div>

          <div class="flex-1" />

          <!-- Search Bar -->
          <div class="relative w-80 hidden md:block">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Search tasks, projects, or team members..."
              class="pl-10 h-10 bg-background/50 border-border/50 focus:bg-background"
            />
          </div>

          <!-- Action Icons -->
          <div class="flex items-center gap-2">
            <ModeToggle />

            <Button variant="ghost" size="icon" class="relative">
              <BellIcon class="h-5 w-5" />
              <span
                class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-1 ring-card"
              />
            </Button>
          </div>

          <!-- User Profile -->
          <div class="hidden md:flex items-center gap-3 pl-4 ml-4 border-l">
            <div class="text-right">
              <p class="text-sm font-semibold text-foreground leading-none">
                Quick Log
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                Task - Notes - Logs
              </p>
            </div>
            <Icon icon="lucide:plus" class="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6 min-h-[calc(100vh-4rem)]">
        <router-view />
      </main>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Mobile Sidebar -->
    <Transition
      enter-active-class="transition ease-in-out duration-300 transform"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in-out duration-300 transform"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="sidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl lg:hidden"
      >
        <!-- Mobile Logo Header -->
        <div class="flex h-16 items-center px-6 border-b">
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-br from-primary to-primary/80 shadow-md"
            >
              <span class="text-foreground font-bold text-lg tracking-tight"
                >T</span
              >
            </div>
            <div class="flex flex-col">
              <span
                class="text-base font-semibold tracking-tight leading-none text-purple"
              >
                TaskFlow
              </span>
              <span
                class="text-[10px] font-medium text-muted-foreground tracking-wider uppercase mt-0.5"
              >
                Pro
              </span>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav class="flex-1 px-3 py-6 space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all',
              isActive(item.href)
                ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground border-l-2 border-transparent',
            ]"
            @click="sidebarOpen = false"
          >
            <Icon :icon="item.icon" class="h-5 w-5 shrink-0" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Mobile User Profile -->
        <div
          class="absolute bottom-0 left-0 right-0 border-t bg-card/50 backdrop-blur-sm p-4"
        >
          <div class="flex items-center gap-3">
            <Avatar class="h-9 w-9 ring-2 ring-primary/10">
              <AvatarFallback
                class="bg-gradient-to-br from-primary to-primary/80 text-foreground text-sm"
              >
                MO
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate text-foreground">
                Nukesh Ormain
              </p>
              <p class="text-xs text-muted-foreground truncate">
                Project Manager
              </p>
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>
