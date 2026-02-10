<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { LogOut, Settings, UserCircle2, Users } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

defineProps<{ sidebarCollapsed: boolean }>();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const userInitials = computed(() => {
  if (!user.value?.name) return "U";
  return user.value.name
    .split(" ")
    .map((chunk) => chunk[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

const handleLogout = async () => {
  await authStore.logout();
};

onMounted(async () => {
  await authStore.fetchUsers();
});
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton size="lg" class="h-10">
            <Avatar class="size-8">
              <AvatarFallback>{{ userInitials }}</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ authStore.user?.name || 'User' }}</span>
              <span class="truncate text-xs text-muted-foreground">{{ authStore.user?.email }}</span>
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="end">
          <DropdownMenuLabel class="text-xs">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><UserCircle2 class="mr-2 size-4" />Profile</DropdownMenuItem>
          <DropdownMenuItem><Users class="mr-2 size-4" />Users</DropdownMenuItem>
          <DropdownMenuItem><Settings class="mr-2 size-4" />Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-destructive focus:text-destructive" @click="handleLogout">
            <LogOut class="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
