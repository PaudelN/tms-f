<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Bell,
  BrainCircuit,
  ChartNoAxesCombined,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Rocket,
  Workflow,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import ModeToggle from '@/components/common/ModeToggle.vue'

const route = useRoute()

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Workspace', path: '/workspace', icon: FolderKanban },
  { name: 'Insights', path: '/insights', icon: ChartNoAxesCombined },
  { name: 'Automation', path: '/automation', icon: Workflow },
  { name: 'Roadmap', path: '/roadmap', icon: Rocket },
]

const activeLabel = computed(() => navigation.find((item) => route.path.startsWith(item.path))?.name ?? 'Overview')
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <div class="flex items-center gap-2 px-2 py-1">
          <div class="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">T</div>
          <div>
            <p class="text-sm font-semibold">Taskification</p>
            <p class="text-xs text-muted-foreground">Enterprise Workspace</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navigation" :key="item.path">
                <SidebarMenuButton as-child :is-active="route.path.startsWith(item.path)">
                  <router-link :to="item.path" class="gap-2">
                    <component :is="item.icon" class="size-4" />
                    <span>{{ item.name }}</span>
                  </router-link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div class="rounded-xl border border-border bg-card p-2 text-xs text-muted-foreground">
          <div class="flex items-center gap-2 text-foreground"><BrainCircuit class="size-4" /> GPT Assisted UI</div>
          <p class="mt-1">Calm claymorphism enterprise shell.</p>
        </div>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <SidebarTrigger>
            <Button variant="outline" size="icon"><Menu class="size-4" /></Button>
          </SidebarTrigger>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink as-child><router-link to="/dashboard">Home</router-link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{{ activeLabel }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div class="ml-auto flex items-center gap-2">
            <Input placeholder="Search commands" class="hidden w-64 md:block" />
            <ModeToggle />
            <Button size="icon" variant="ghost"><Bell class="size-4" /></Button>
          </div>
        </div>
      </header>

      <main class="min-h-[calc(100vh-64px)] p-4 md:p-6">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
