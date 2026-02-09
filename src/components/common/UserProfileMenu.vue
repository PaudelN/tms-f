<template>
  <div
    ref="menuRef"
    class="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-card/70 backdrop-blur"
  >
    <div class="relative">
      <div
        v-if="!isCollapsed"
        @click="toggleProfile"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/40 transition-colors"
      >
        <Avatar class="h-9 w-9 ring-1 ring-border/60">
          <AvatarFallback
            class="bg-linear-to-br from-primary to-primary/80 text-foreground text-sm font-semibold"
          >
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 min-w-0 leading-tight">
          <p class="text-sm font-medium truncate">
            {{ authStore.user?.name || "User" }}
          </p>
          <p class="text-xs text-muted-foreground truncate">
            {{ authStore.user?.email || "" }}
          </p>
        </div>

        <ChevronDown
          class="h-4 w-4 text-muted-foreground transition-transform duration-200"
          :class="profileOpen ? '-rotate-90' : ''"
        />
      </div>

      <div
        v-else
        @click="toggleProfile"
        class="flex justify-center px-4 py-3 cursor-pointer hover:bg-accent/40 transition-colors"
      >
        <Avatar class="h-9 w-9 ring-1 ring-border/60">
          <AvatarFallback
            class="bg-linear-to-br from-primary to-primary/80 text-foreground text-sm font-semibold"
          >
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-2 scale-95"
      >
        <div
          v-if="profileOpen"
          class="absolute bottom-3 left-full ml-3 w-72 rounded-xl bg-card border border-border/60 shadow-2xl z-50"
        >
          <div class="px-4 py-3 border-b border-border/60">
            <p class="text-xs font-semibold text-muted-foreground uppercase">
              Signed in as
            </p>

            <div class="flex items-center gap-3 mt-2">
              <Avatar class="h-10 w-10 ring-1 ring-border/60">
                <AvatarFallback
                  class="bg-linear-to-br from-primary to-primary/80 text-foreground text-sm font-semibold"
                >
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>

              <div class="leading-tight min-w-0">
                <p class="text-sm font-semibold truncate">
                  {{ authStore.user?.name || "User" }}
                </p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ authStore.user?.email || "" }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="authStore.users.length > 0" class="px-2 py-2">
            <p
              class="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase"
            >
              Team Members ({{ authStore.users.length }})
            </p>

            <div class="max-h-48 overflow-y-auto">
              <button
                v-for="user in authStore.users"
                :key="user.id"
                class="group w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Avatar class="h-7 w-7 ring-1 ring-border/60">
                  <AvatarFallback class="text-xs font-semibold">
                    {{ getInitials(user.name) }}
                  </AvatarFallback>
                </Avatar>

                <div class="min-w-0 text-left">
                  <p class="text-sm truncate">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground truncate">
                    {{ user.email }}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div class="p-2 border-t border-border/60 space-y-1">
            <button
              @click="profileOpen = false"
              class="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <IdCard class="h-4 w-4" />
              Profile
            </button>

            <button
              @click="profileOpen = false"
              class="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Users class="h-4 w-4" />
              Users
            </button>

            <button
              @click="profileOpen = false"
              class="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Settings class="h-4 w-4" />
              Settings
            </button>

            <div class="h-px bg-border/60 my-1" />

            <button
              @click="handleLogout"
              class="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut class="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import { ChevronDown, IdCard, LogOut, Settings, Users } from "lucide-vue-next";
import { onClickOutside } from "@vueuse/core";
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { useSidebar } from "@/components/ui/sidebar";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore); 
const { state } = useSidebar();
const isCollapsed = computed(() => state.value === "collapsed");

const menuRef = ref<HTMLElement | null>(null);
const profileOpen = ref(false);

const toggleProfile = () => {
  profileOpen.value = !profileOpen.value;
};

const userInitials = computed(() => {
  if (!user.value?.name) return "U";
  const names = user.value.name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return user.value.name.substring(0, 2).toUpperCase();
});

const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const handleLogout = async () => {
  profileOpen.value = false;
  await authStore.logout();
};

onClickOutside(menuRef, () => {
  profileOpen.value = false;
});

onMounted(async () => {
  await authStore.fetchUsers(); 
});
</script>
