<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center space-y-4">
      <Spinner class="w-8 h-8 mx-auto text-primary" />
      <p class="text-muted-foreground text-sm">{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Spinner from "@/components/ui/spinner/Spinner.vue";
  import { resetCsrfToken } from "@/lib/axios";
  import { useAuthStore } from "@/stores/auth";
  import { onMounted, ref } from "vue";
  import { useRouter } from "vue-router";

  const authStore = useAuthStore();
  const router = useRouter();
  const statusMessage = ref("Completing sign-in…");

  onMounted(async () => {
    resetCsrfToken(); // fetch CSRF if needed

    try {
      await authStore.getUser(); // now should work with session cookie
    } catch {
      router.push({ name: "login", query: { error: "social_auth_failed" } });
      return;
    }

    if (authStore.isLoggedIn) {
      statusMessage.value = "Success! Redirecting…";
      setTimeout(() => router.push({ name: "dashboard" }), 800);
    } else {
      router.push({ name: "login", query: { error: "social_auth_failed" } });
    }
  });
</script>
