<template>
  <div>
    <h1>Welcome back, {{ user?.name }}</h1>
    <p>{{ user?.email }}</p>

    <hr />

    <h2>Users List</h2>
    <ul class="list-disc pl-6">
      <li v-for="u in users" :key="u.id">
        {{ u.name }} - {{ u.email }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { user, users } = storeToRefs(authStore); 

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await authStore.getUser();
    await authStore.fetchUsers();
  }
});
</script>
