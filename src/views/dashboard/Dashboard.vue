<template>
  <div class="max-w-5xl mx-auto p-6 space-y-8">
    
    <!-- User Profile -->
    <div class="flex items-center gap-4 p-6 bg-white border rounded-xl shadow-sm">
      <div
        class="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-lg"
      >
        {{ user?.name?.charAt(0) }}
      </div>

      <div>
        <h1 class="text-xl font-semibold text-gray-800">
          Welcome back, {{ user?.name }}
        </h1>
        <p class="text-sm text-gray-500">
          {{ user?.email }}
        </p>
      </div>
    </div>

    <!-- Users Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">
          Users
        </h2>

        <span class="text-sm text-gray-500">
          {{ users.length }} members
        </span>
      </div>

      <!-- Users Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <div
          v-for="u in users"
          :key="u.id"
          class="p-5 bg-white border rounded-xl hover:shadow-md transition duration-200 cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700"
            >
              {{ u.name.charAt(0) }}
            </div>

            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">
                {{ u.name }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ u.email }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!users.length"
        class="text-center py-10 text-sm text-gray-400"
      >
        No users found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const authStore = useAuthStore();
const { user, users } = storeToRefs(authStore);

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await authStore.getUser();
    await authStore.fetchUsers();
  }
});
</script>