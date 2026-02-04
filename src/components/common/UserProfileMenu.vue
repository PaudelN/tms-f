<script setup lang="ts">
  import Avatar from "@/components/ui/avatar/Avatar.vue";
  import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
  import { ChevronDownIcon } from "@heroicons/vue/24/outline";
  import { Icon } from "@iconify/vue";
  import { onClickOutside } from "@vueuse/core";
  import { ref } from "vue";

  defineProps<{
    sidebarCollapsed: boolean;
  }>();

  const menuRef = ref<HTMLElement | null>(null);
  const profileOpen = ref(false);

  const toggleProfile = () => {
    profileOpen.value = !profileOpen.value;
  };

  onClickOutside(menuRef, () => {
    profileOpen.value = false;
  });

  const users = [
    { id: 1, name: "Manish Ormain", role: "Project Manager", initials: "MO" },
    { id: 2, name: "Aarav Singh", role: "Frontend Engineer", initials: "AS" },
    { id: 3, name: "Riya Sharma", role: "UX Designer", initials: "RS" },
  ];
</script>

<template>
  <!-- ROOT WRAPPER (IMPORTANT FOR onClickOutside) -->
  <div
    ref="menuRef"
    class="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-card/70 backdrop-blur"
  >
    <div class="relative">
      <!-- EXPANDED SIDEBAR -->
      <div
        v-if="!sidebarCollapsed"
        @click="toggleProfile"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/40 transition-colors"
      >
        <Avatar class="h-9 w-9 ring-1 ring-border/60">
          <AvatarFallback
            class="bg-gradient-to-br from-primary to-primary/80 text-foreground text-sm font-semibold"
          >
            MO
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 min-w-0 leading-tight">
          <p class="text-sm font-medium truncate">Manish Ormain</p>
          <p class="text-xs text-muted-foreground truncate">Project Manager</p>
        </div>

        <ChevronDownIcon
          class="h-4 w-4 text-muted-foreground transition-transform duration-200"
          :class="profileOpen ? '-rotate-90' : ''"
        />
      </div>

      <!-- COLLAPSED SIDEBAR -->
      <div
        v-else
        @click="toggleProfile"
        class="flex justify-center px-4 py-3 cursor-pointer hover:bg-accent/40 transition-colors"
      >
        <Avatar class="h-9 w-9 ring-1 ring-border/60">
          <AvatarFallback
            class="bg-gradient-to-br from-primary to-primary/80 text-foreground text-sm font-semibold"
          >
            MO
          </AvatarFallback>
        </Avatar>
      </div>

      <!-- DROPDOWN MENU -->
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
          <!-- CURRENT USER -->
          <div class="px-4 py-3 border-b border-border/60">
            <p class="text-xs font-semibold text-muted-foreground uppercase">
              Signed in as
            </p>

            <div class="flex items-center gap-3 mt-2">
              <Avatar class="h-10 w-10 ring-1 ring-border/60">
                <AvatarFallback
                  class="bg-gradient-to-br from-primary to-primary/80 text-foreground text-sm font-semibold"
                >
                  MO
                </AvatarFallback>
              </Avatar>

              <div class="leading-tight min-w-0">
                <p class="text-sm font-semibold truncate">Manish Ormain</p>
                <p class="text-xs text-muted-foreground truncate">
                  Project Manager
                </p>
              </div>
            </div>
          </div>

          <!-- USER SWITCHER -->
          <div class="px-2 py-2">
            <p
              class="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase"
            >
              Team Members
            </p>

            <button
              v-for="user in users"
              :key="user.id"
              class="group w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Avatar class="h-7 w-7 ring-1 ring-border/60">
                <AvatarFallback class="text-xs font-semibold">
                  {{ user.initials }}
                </AvatarFallback>
              </Avatar>

              <div class="min-w-0 text-left">
                <p class="text-sm truncate">{{ user.name }}</p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ user.role }}
                </p>
              </div>
            </button>
          </div>

          <!-- ACTIONS -->
          <div class="p-2 border-t border-border/60 space-y-1">
            <button
              @click="profileOpen = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Icon icon="lucide:id-card" class="h-4 w-4" />
              Profile
            </button>

            <button
              @click="profileOpen = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Icon icon="lucide:users" class="h-4 w-4" />
              Users
            </button>

            <button
              @click="profileOpen = false"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              <Icon icon="lucide:settings" class="h-4 w-4" />
              Settings
            </button>

            <div class="h-px bg-border/60 my-1" />

            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Icon icon="lucide:log-out" class="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
