<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  Activity,
  BarChart3,
  File,
  FolderKanban,
  Home,
  KeyRound,
  Settings,
  Users,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface SidebarLink {
  label: string
  routeName:
    | 'workspace-overview'
    | 'workspace-work'
    | 'workspace-activity'
    | 'workspace-files'
    | 'workspace-members'
    | 'workspace-analytics'
    | 'workspace-settings'
    | 'workspace-access'
  icon: typeof Home
}

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()

const workspaceId = computed(() => String(route.params.id ?? ''))

// Sidebar navigation entries for the workspace detail sections.
const links: SidebarLink[] = [
  { label: 'Overview', routeName: 'workspace-overview', icon: Home },
  { label: 'Work (list / kanban)', routeName: 'workspace-work', icon: FolderKanban },
  { label: 'Activity', routeName: 'workspace-activity', icon: Activity },
  { label: 'Files', routeName: 'workspace-files', icon: File },
  { label: 'Members', routeName: 'workspace-members', icon: Users },
  { label: 'Analytics', routeName: 'workspace-analytics', icon: BarChart3 },
  { label: 'Settings', routeName: 'workspace-settings', icon: Settings },
  { label: 'Access', routeName: 'workspace-access', icon: KeyRound },
]

const isActive = (routeName: SidebarLink['routeName']) => route.name === routeName
</script>

<template>
  <nav aria-label="Workspace sections" class="space-y-1">
    <RouterLink
      v-for="link in links"
      :key="link.routeName"
      :to="{ name: link.routeName, params: { id: workspaceId } }"
      :class="cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive(link.routeName)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )"
      @click="emit('navigate')"
    >
      <component :is="link.icon" class="h-4 w-4 shrink-0" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>
