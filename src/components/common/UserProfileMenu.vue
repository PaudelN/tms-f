<template>
  <div ref="triggerRef" class="px-2 pb-2">

    <!-- Collapsed: avatar icon only -->
    <button
      v-if="collapsed"
      type="button"
      class="flex h-10 w-full items-center justify-center rounded-lg transition-colors hover:bg-accent"
      @click="toggleMenu"
    >
      <div class="relative shrink-0">
        <Avatar class="h-7 w-7 ring-2 ring-border/60">
          <AvatarFallback
            class="text-[11px] font-bold text-primary-foreground"
            :style="{ background: avatarGradient }"
          >
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
        <span class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-sidebar bg-emerald-400" />
      </div>
    </button>

    <!-- Expanded: full row -->
    <button
      v-else
      type="button"
      class="group flex h-11 w-full items-center gap-2.5 rounded-lg px-2 transition-colors hover:bg-accent"
      @click="toggleMenu"
    >
      <div class="relative shrink-0">
        <Avatar class="h-7 w-7 ring-2 ring-border/60">
          <AvatarFallback
            class="text-[11px] font-bold text-primary-foreground"
            :style="{ background: avatarGradient }"
          >
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
        <span class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-sidebar bg-emerald-400" />
      </div>
      <div class="min-w-0 flex-1 text-left leading-tight">
        <p class="truncate text-[13px] font-semibold text-foreground">
          {{ authStore.user?.name || 'User' }}
        </p>
        <p class="truncate text-[10px] text-muted-foreground/60">
          {{ authStore.user?.email || '' }}
        </p>
      </div>
      <ChevronsUpDown
        class="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Menu — always teleported to body, always to the RIGHT of the sidebar -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-x-2 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-2 scale-95"
      >
        <div
          v-if="isOpen"
          ref="menuRef"
          class="fixed z-[500] w-[264px] overflow-hidden rounded-xl border border-border/60 bg-popover shadow-2xl"
          :style="menuStyle"
        >
          <!-- User header -->
          <div class="flex items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-3.5">
            <div class="relative shrink-0">
              <Avatar class="h-9 w-9 ring-2 ring-border/60">
                <AvatarFallback
                  class="text-sm font-bold text-primary-foreground"
                  :style="{ background: avatarGradient }"
                >
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
              <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-popover bg-emerald-400" />
            </div>
            <div class="min-w-0 flex-1 leading-tight">
              <p class="truncate text-[13px] font-semibold text-foreground">
                {{ authStore.user?.name || 'User' }}
              </p>
              <p class="truncate text-[11px] text-muted-foreground/60">
                {{ authStore.user?.email || '' }}
              </p>
            </div>
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Online
            </span>
          </div>

          <!-- Team members -->
          <template v-if="teamMembers.length > 0">
            <div class="border-b border-border/50">
              <p class="px-4 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Team · {{ teamMembers.length }}
              </p>
              <div class="max-h-36 space-y-0.5 overflow-y-auto px-2 pb-2">
                <div
                  v-for="member in teamMembers"
                  :key="member.id"
                  class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
                >
                  <Avatar class="h-6 w-6 shrink-0 ring-1 ring-border/60">
                    <AvatarFallback class="text-[10px] font-bold">
                      {{ getInitials(member.name) }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0">
                    <p class="truncate text-[12px] font-medium text-foreground">{{ member.name }}</p>
                    <p class="truncate text-[10px] text-muted-foreground/60">{{ member.email }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Actions -->
          <div class="space-y-0.5 p-1.5">
            <button
              v-for="action in menuActions"
              :key="action.label"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors"
              :class="action.destructive
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-foreground/80 hover:bg-accent hover:text-foreground'"
              @click="action.handler"
            >
              <div
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                :class="action.destructive ? 'bg-destructive/10' : 'bg-muted/60'"
              >
                <component
                  :is="action.icon"
                  class="h-3.5 w-3.5"
                  :class="action.destructive ? 'text-destructive' : 'text-muted-foreground'"
                />
              </div>
              {{ action.label }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronsUpDown, IdCard, LogOut, Settings, Users } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import type { Component } from 'vue'

withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })

const router    = useRouter()
const authStore = useAuthStore()
const { user }  = storeToRefs(authStore)

const isOpen     = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef    = ref<HTMLElement | null>(null)

// Always position the menu to the RIGHT of the sidebar trigger
const menuStyle = ref<Record<string, string>>({})

async function toggleMenu() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    positionMenu()
  }
}

function positionMenu() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()

  // Sidebar is always to the left — open menu to the RIGHT of the sidebar
  // Find the sidebar's right edge (trigger's parent sidebar width)
  const sidebar = triggerRef.value.closest('[data-sidebar="sidebar"]') as HTMLElement | null
  const sidebarRight = sidebar ? sidebar.getBoundingClientRect().right : rect.right

  const MENU_H  = 320 // approx height
  const GAP     = 8
  const left    = sidebarRight + GAP

  // Anchor bottom of menu to bottom of trigger, clamp to viewport
  let bottom = window.innerHeight - rect.bottom
  const maxBottom = window.innerHeight - MENU_H - 8
  bottom = Math.max(8, Math.min(bottom, maxBottom))

  menuStyle.value = {
    left:   `${left}px`,
    bottom: `${bottom}px`,
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    isOpen.value &&
    menuRef.value && !menuRef.value.contains(target) &&
    triggerRef.value && !triggerRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') isOpen.value = false
}

// Avatar gradient
const avatarGradient = computed(() => {
  const name   = user.value?.name ?? 'User'
  const colors = [
    ['#7C3AED', '#5B21B6'],
    ['#2563EB', '#1D4ED8'],
    ['#059669', '#047857'],
    ['#D97706', '#B45309'],
    ['#DC2626', '#B91C1C'],
    ['#0891B2', '#0E7490'],
  ] as const
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const [a, b] = colors[Math.abs(h) % colors.length]
  return `linear-gradient(135deg, ${a}, ${b})`
})

// Initials
const userInitials = computed<string>(() => {
  const name  = user.value?.name ?? ''
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'U'
})

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

// Team members
const teamMembers = computed<Array<{ id: number; name: string; email: string }>>(() => {
  return (authStore as any).users ?? []
})

// Menu action list
interface MenuAction {
  label: string
  icon: Component
  destructive?: boolean
  handler: () => void
}

const menuActions = computed<MenuAction[]>(() => [
  { label: 'Profile',      icon: IdCard,   handler: () => { isOpen.value = false } },
  { label: 'Team members', icon: Users,    handler: () => { isOpen.value = false } },
  { label: 'Settings',     icon: Settings, handler: () => { isOpen.value = false } },
  {
    label: 'Sign out',
    icon: LogOut,
    destructive: true,
    handler: handleLogout,
  },
])

async function handleLogout() {
  isOpen.value = false
  await authStore.logout?.()
  router.push({ name: 'login' })
}

onMounted(async () => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onEsc)
  if (typeof (authStore as any).fetchUsers === 'function') {
    await (authStore as any).fetchUsers()
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onEsc)
})
</script>