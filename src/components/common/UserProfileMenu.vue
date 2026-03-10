<template>
  <div ref="menuRef" class="px-2 pb-2">
    <!-- ── Collapsed: icon only ──────────────────────────────── -->
    <Button
      v-if="collapsed"
      variant="ghost"
      size="icon"
      class="w-full h-10 flex items-center justify-center"
      @click="toggleProfile"
    >
      <Avatar class="h-7 w-7 ring-1 ring-border/60 shrink-0">
        <AvatarFallback class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[11px] font-bold">
          {{ userInitials }}
        </AvatarFallback>
      </Avatar>
    </Button>

    <!-- ── Expanded: full row ────────────────────────────────── -->
    <Button
      v-else
      variant="ghost"
      class="w-full h-11 justify-start gap-3 px-2"
      @click="toggleProfile"
    >
      <Avatar class="h-7 w-7 ring-1 ring-border/60 shrink-0">
        <AvatarFallback class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[11px] font-bold">
          {{ userInitials }}
        </AvatarFallback>
      </Avatar>
      <div class="flex-1 min-w-0 text-left leading-tight">
        <p class="text-[13px] font-semibold truncate">{{ authStore.user?.name || 'User' }}</p>
        <p class="text-[11px] text-muted-foreground truncate">{{ authStore.user?.email || '' }}</p>
      </div>
      <ChevronsUpDown class="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
    </Button>

    <!-- ── Flyout (opens UPWARD) ──────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="profileOpen"
        class="absolute bottom-full left-2 right-2 mb-1 rounded-xl bg-popover border border-border shadow-2xl z-[100] overflow-hidden"
      >
        <!-- User header -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-muted/30">
          <Avatar class="h-9 w-9 ring-2 ring-border/60 shrink-0">
            <AvatarFallback class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1 min-w-0 leading-tight">
            <p class="text-[13px] font-semibold text-foreground truncate">{{ authStore.user?.name || 'User' }}</p>
            <p class="text-[11px] text-muted-foreground truncate">{{ authStore.user?.email || '' }}</p>
          </div>
          <span class="h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>

        <!-- Team members (Phase 2+) -->
        <div v-if="teamMembers.length > 0" class="border-b border-border/60">
          <p class="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Team ({{ teamMembers.length }})
          </p>
          <div class="max-h-36 overflow-y-auto px-2 pb-2 space-y-0.5">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar class="h-6 w-6 ring-1 ring-border/60 shrink-0">
                <AvatarFallback class="text-[10px] font-bold">{{ getInitials(member.name) }}</AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="text-[12px] font-medium truncate">{{ member.name }}</p>
                <p class="text-[10px] text-muted-foreground truncate">{{ member.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-1.5 space-y-0.5">
          <Button variant="ghost" class="w-full justify-start gap-2.5 text-[13px] h-8 px-2.5" @click="profileOpen = false">
            <IdCard class="h-4 w-4 text-muted-foreground shrink-0" />
            Profile
          </Button>
          <Button variant="ghost" class="w-full justify-start gap-2.5 text-[13px] h-8 px-2.5" @click="profileOpen = false">
            <Users class="h-4 w-4 text-muted-foreground shrink-0" />
            Users
          </Button>
          <Button variant="ghost" class="w-full justify-start gap-2.5 text-[13px] h-8 px-2.5" @click="profileOpen = false">
            <Settings class="h-4 w-4 text-muted-foreground shrink-0" />
            Settings
          </Button>
          <div class="h-px bg-border/60 mx-1 my-1" />
          <Button
            variant="ghost"
            class="w-full justify-start gap-2.5 text-[13px] h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4 shrink-0" />
            Sign out
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown, IdCard, LogOut, Settings, Users } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

// ── Props ───────────────────────────────────────────────────────────────────
// collapsed is passed by AppSidebar via the isSidebarCollapsed computed.
// We intentionally do NOT call useSidebar() here to avoid injection errors.
withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })

const router    = useRouter()
const authStore = useAuthStore()
const { user }  = storeToRefs(authStore)

const menuRef     = ref<HTMLElement | null>(null)
const profileOpen = ref(false)

function toggleProfile() { profileOpen.value = !profileOpen.value }

// ── Initials ────────────────────────────────────────────────────────────────
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

// ── Team members (Phase 2+) ─────────────────────────────────────────────────
const teamMembers = computed<Array<{ id: number; name: string; email: string }>>(() => {
  return (authStore as any).users ?? []
})

// ── Actions ─────────────────────────────────────────────────────────────────
async function handleLogout() {
  profileOpen.value = false
  await authStore.logout?.()
  router.push({ name: 'login' })
}

onClickOutside(menuRef, () => { profileOpen.value = false })

onMounted(async () => {
  if (typeof (authStore as any).fetchUsers === 'function') {
    await (authStore as any).fetchUsers()
  }
})
</script>