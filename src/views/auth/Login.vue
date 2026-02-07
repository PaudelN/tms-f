<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12"
  >
    <div class="absolute inset-0 overflow-hidden opacity-5">
      <div class="absolute top-20 left-10 animate-float">
        <Icon icon="lucide:log-in" class="w-20 h-20 text-primary" />
      </div>
      <div class="absolute top-40 right-20 animate-float-delay-1">
        <Icon icon="lucide:shield-check" class="w-24 h-24 text-primary" />
      </div>
      <div class="absolute bottom-32 left-1/4 animate-float-delay-2">
        <Icon icon="lucide:sparkles" class="w-16 h-16 text-primary" />
      </div>
      <div class="absolute bottom-20 right-1/3 animate-float-delay-3">
        <Icon icon="lucide:lock" class="w-20 h-20 text-primary" />
      </div>
    </div>

    <div class="relative z-10 w-full max-w-lg mx-4">
      <div
        class="bg-card border border-border rounded-lg shadow-lg p-8 animate-slide-up"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex flex-col items-center justify-center px-6 py-4"
          >
            <span
              class="text-primary font-extrabold text-2xl tracking-tight leading-none"
            >
              TαskιFιcαtιση
            </span>

            <span
              class="mt-1 text-primary text-[11px] font-medium tracking-widest uppercase"
            >
              Track · Plan · Achieve
            </span>
          </div>

          <h1 class="text-3xl font-bold text-gray-700 mb-2">Welcome Back</h1>
          <p class="text-muted-foreground">Sign in to continue your journey</p>
        </div>

        <!-- Success Message -->
        <div
          v-if="authStore.successMessage"
          class="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 animate-slide-down"
        >
          <Icon
            icon="lucide:check-circle"
            class="w-5 h-5 text-green-600 dark:text-green-400"
          />
          <p class="text-green-600 dark:text-green-400 text-sm">
            {{ authStore.successMessage }}
          </p>
        </div>

        <!-- Error Message -->
        <div
          v-if="authStore.loginErrors.general"
          class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 animate-slide-down"
        >
          <Icon
            icon="lucide:alert-circle"
            class="w-5 h-5 text-red-600 dark:text-red-400"
          />
          <p class="text-red-600 dark:text-red-400 text-sm">
            {{ authStore.loginErrors.general }}
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Field -->
          <div class="space-y-2 animate-fade-in" style="animation-delay: 0.1s">
            <Label
              class="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Icon icon="lucide:mail" class="w-4 h-4" />
              Email Address
            </Label>
            <div class="relative group">
              <Input
                v-model="formData.email"
                type="email"
                required
                placeholder="you@example.com"
                :disabled="authStore.isLoading"
                class="w-full px-4 py-3 pl-11 bg-background border border-Input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                :class="{
                  'border-red-500 focus:ring-red-500':
                    authStore.loginErrors.email,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Icon icon="lucide:at-sign" class="w-5 h-5" />
              </div>
            </div>
            <p
              v-if="authStore.loginErrors.email"
              class="text-red-500 text-sm flex items-center gap-1 animate-shake"
            >
              <Icon icon="lucide:alert-circle" class="w-3.5 h-3.5" />
              {{
                Array.isArray(authStore.loginErrors.email)
                  ? authStore.loginErrors.email[0]
                  : authStore.loginErrors.email
              }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2 animate-fade-in" style="animation-delay: 0.2s">
            <Label
              class="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Icon icon="lucide:lock" class="w-4 h-4" />
              Password
            </Label>
            <div class="relative group">
              <Input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Enter your password"
                :disabled="authStore.isLoading"
                class="w-full px-4 py-3 pl-11 pr-11 bg-background border border-Input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                :class="{
                  'border-red-500 focus:ring-red-500':
                    authStore.loginErrors.password,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Icon icon="lucide:key" class="w-5 h-5" />
              </div>
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="authStore.isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Icon v-if="!showPassword" icon="lucide:eye" class="w-5 h-5" />
                <Icon v-else icon="lucide:eye-off" class="w-5 h-5" />
              </button>
            </div>
            <p
              v-if="authStore.loginErrors.password"
              class="text-red-500 text-sm flex items-center gap-1 animate-shake"
            >
              <Icon icon="lucide:alert-circle" class="w-3.5 h-3.5" />
              {{
                Array.isArray(authStore.loginErrors.password)
                  ? authStore.loginErrors.password[0]
                  : authStore.loginErrors.password
              }}
            </p>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div
            class="flex items-center justify-between animate-fade-in"
            style="animation-delay: 0.3s"
          >
            <div class="flex items-center gap-2">
              <Checkbox
                type="checkbox"
                id="remember"
                v-model="formData.remember"
                class="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring cursor-pointer"
              />
              <Label
                for="remember"
                class="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Remember me
              </Label>
            </div>
            <a
              href="/forgot-password"
              class="text-sm text-primary hover:underline font-semibold transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fade-in"
            style="animation-delay: 0.4s"
          >
            <template v-if="authStore.isLoading">
              <Icon icon="svg-spinners:ring-resize" class="w-5 h-5" />
              Signing in...
            </template>
            <template v-else> Sign In </template>
          </Button>
        </form>

        <!-- Divider -->
        <div
          class="relative my-6 animate-fade-in"
          style="animation-delay: 0.5s"
        >
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">
              Or continue with (Coming Soon)
            </span>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div
          class="grid grid-cols-2 gap-3 animate-fade-in"
          style="animation-delay: 0.6s"
        >
          <Button
            type="button"
            variant="outline"
            class="w-full py-2.5 flex items-center justify-center gap-2 border-border hover:bg-accent transition-colors"
          >
            <Icon icon="lucide:chrome" class="w-5 h-5" />
            <span class="text-sm font-medium">Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            class="w-full py-2.5 flex items-center justify-center gap-2 border-border hover:bg-accent transition-colors"
          >
            <Icon icon="lucide:github" class="w-5 h-5" />
            <span class="text-sm font-medium">GitHub</span>
          </Button>
        </div>

        <div
          class="mt-6 text-center animate-fade-in"
          style="animation-delay: 0.7s"
        >
          <p class="text-muted-foreground text-sm">
            Don't have an account?
            <a
              href="/register"
              class="text-primary hover:underline font-semibold transition-colors ml-1"
            >
              Sign up here
            </a>
          </p>
        </div>

        <div
          class="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-xs animate-fade-in"
          style="animation-delay: 0.8s"
        >
          <Icon icon="lucide:shield-check" class="w-3.5 h-3.5" />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Button from "@/components/ui/button/Button.vue";
  import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
  import Input from "@/components/ui/input/Input.vue";
  import Label from "@/components/ui/label/Label.vue";
  import { useAuthStore } from "@/stores/auth";
  import type { LoginForm } from "@/types/loginForm";
  import { Icon } from "@iconify/vue";
  import { onMounted, ref } from "vue";
  import { useRouter } from "vue-router";

  const authStore = useAuthStore();
  const showPassword = ref(false);
  const router = useRouter();
  const formData = ref<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });

  const handleLogin = async () => {
    authStore.clearErrors();
    await authStore.login(formData.value);
  };

  onMounted(() => {
    if (authStore.isLoggedIn) {
      router.push({ name: "dashboard" });
    }
  });
</script>

<style scoped>
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes float-delay-1 {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-15px);
    }
  }

  @keyframes float-delay-2 {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  @keyframes float-delay-3 {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  .animate-float {
    animation: float 8s ease-in-out infinite;
  }

  .animate-float-delay-1 {
    animation: float-delay-1 9s ease-in-out infinite;
  }

  .animate-float-delay-2 {
    animation: float-delay-2 10s ease-in-out infinite;
  }

  .animate-float-delay-3 {
    animation: float-delay-3 11s ease-in-out infinite;
  }

  .animate-slide-up {
    animation: slide-up 0.5s ease-out;
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
    opacity: 0;
  }

  .animate-shake {
    animation: shake 0.3s ease-in-out;
  }
</style>
