<template>
  <div>
    <h1>Welcome back, {{ user?.name }}</h1>
    <p>{{ user?.email }}</p>

    <hr />

    <h2>Users List</h2>
    <ul>
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

<style scoped>
ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
</style>
