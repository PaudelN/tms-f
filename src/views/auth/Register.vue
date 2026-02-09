<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12"
  >
    <div class="absolute inset-0 overflow-hidden opacity-5">
      <div class="absolute top-20 left-10 animate-float">
        <UserPlus class="w-20 h-20 text-primary" />
      </div>
      <div class="absolute top-40 right-20 animate-float-delay-1">
        <ShieldCheck class="w-24 h-24 text-primary" />
      </div>
      <div class="absolute bottom-32 left-1/4 animate-float-delay-2">
        <Sparkles class="w-16 h-16 text-primary" />
      </div>
      <div class="absolute bottom-20 right-1/3 animate-float-delay-3">
        <Lock class="w-20 h-20 text-primary" />
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

          <h1 class="text-3xl font-bold text-gray-700 mb-2">Create Account</h1>
          <p class="text-muted-foreground">
            Join us and start your journey today
          </p>
        </div>

        <div
          v-if="authStore.successMessage"
          class="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 animate-slide-down"
        >
          <CheckCircle2 class="w-5 h-5 text-green-600 dark:text-green-400" />
          <p class="text-green-600 dark:text-green-400 text-sm">
            {{ authStore.successMessage }}
          </p>
        </div>

        <div
          v-if="authStore.registrationErrors.general"
          class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 animate-slide-down"
        >
          <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
          <p class="text-red-600 dark:text-red-400 text-sm">
            {{ authStore.registrationErrors.general }}
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="space-y-2 animate-fade-in animate-delay-100">
            <Label
              class="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <User class="w-4 h-4" />
              Full Name
            </Label>
            <div class="relative group">
              <Input
                v-model="formData.name"
                type="text"
                required
                placeholder="John Doe"
                :disabled="authStore.isLoading"
                class="w-full px-4 py-3 pl-11 bg-background border border-Input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                :class="{
                  'border-red-500 focus:ring-red-500':
                    authStore.registrationErrors.name,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <CircleUser class="w-5 h-5" />
              </div>
            </div>
            <p
              v-if="authStore.registrationErrors.name"
              class="text-red-500 text-sm flex items-center gap-1 animate-shake"
            >
              <AlertCircle class="w-3.5 h-3.5" />
              {{
                Array.isArray(authStore.registrationErrors.name)
                  ? authStore.registrationErrors.name[0]
                  : authStore.registrationErrors.name
              }}
            </p>
          </div>

          <div class="space-y-2 animate-fade-in animate-delay-200">
            <Label
              class="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Mail class="w-4 h-4" />
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
                    authStore.registrationErrors.email,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <AtSign class="w-5 h-5" />
              </div>
            </div>
            <p
              v-if="authStore.registrationErrors.email"
              class="text-red-500 text-sm flex items-center gap-1 animate-shake"
            >
              <AlertCircle class="w-3.5 h-3.5" />
              {{
                Array.isArray(authStore.registrationErrors.email)
                  ? authStore.registrationErrors.email[0]
                  : authStore.registrationErrors.email
              }}
            </p>
          </div>

          <div class="space-y-2 animate-fade-in animate-delay-300">
            <Label
              class="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Lock class="w-4 h-4" />
              Password
            </Label>
            <div class="relative group">
              <Input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Create a strong password"
                :disabled="authStore.isLoading"
                @input="calculatePasswordStrength"
                class="w-full px-4 py-3 pl-11 pr-11 bg-background border border-Input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                :class="{
                  'border-red-500 focus:ring-red-500':
                    authStore.registrationErrors.password,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Key class="w-5 h-5" />
              </div>
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="authStore.isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>

            <div class="space-y-2" v-if="formData.password">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">Password Strength:</span>
                <span
                  class="font-semibold transition-colors duration-300"
                  :class="passwordStrength.colorClass"
                >
                  {{ passwordStrength.Label }}
                </span>
              </div>
              <div class="relative w-full rounded-full bg-muted">
                <Progress
                  :model-value="passwordStrength.percentage"
                  :indicator-class="passwordStrength.bgClass"
                />
              </div>
              <div class="flex gap-2 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="hasMinLength ? 'bg-green-500' : 'bg-muted'"
                  ></div>
                  8+ chars
                </span>
                <span class="flex items-center gap-1">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="hasUpperCase ? 'bg-green-500' : 'bg-muted'"
                  ></div>
                  Uppercase
                </span>
                <span class="flex items-center gap-1">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="hasNumber ? 'bg-green-500' : 'bg-muted'"
                  ></div>
                  Number
                </span>
                <span class="flex items-center gap-1">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="hasSpecialChar ? 'bg-green-500' : 'bg-muted'"
                  ></div>
                  Special
                </span>
              </div>
            </div>

            <p
              v-if="authStore.registrationErrors.password"
              class="text-red-500 text-sm flex items-center gap-1 animate-shake"
            >
              <AlertCircle class="w-3.5 h-3.5" />
              {{
                Array.isArray(authStore.registrationErrors.password)
                  ? authStore.registrationErrors.password[0]
                  : authStore.registrationErrors.password
              }}
            </p>
          </div>

          <div class="space-y-2 animate-fade-in animate-delay-400">
            <Label
              class="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <ShieldCheck class="w-4 h-4" />
              Confirm Password
            </Label>
            <div class="relative group">
              <Input
                v-model="formData.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="Confirm your password"
                :disabled="authStore.isLoading"
                class="w-full px-4 py-3 pl-11 pr-11 bg-background border border-Input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                :class="{
                  'border-red-500 focus:ring-red-500':
                    authStore.registrationErrors.password_confirmation,
                }"
              />
              <div
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Lock class="w-5 h-5" />
              </div>
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="authStore.isLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p
              v-if="authStore.registrationErrors.password_confirmation"
              class="text-red-500 text-sm flex items-center gap-1 animate-shake"
            >
              <AlertCircle class="w-3.5 h-3.5" />
              {{
                Array.isArray(
                  authStore.registrationErrors.password_confirmation,
                )
                  ? authStore.registrationErrors.password_confirmation[0]
                  : authStore.registrationErrors.password_confirmation
              }}
            </p>
          </div>

          <Button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fade-in animate-delay-500"
          >
            <template v-if="authStore.isLoading">
              <Loader2 class="w-5 h-5 animate-spin" />
              Creating Account...
            </template>
            <template v-else> Create Account </template>
          </Button>
        </form>

        <div class="mt-6 text-center animate-fade-in animate-delay-600">
          <p class="text-muted-foreground text-sm">
            Already have an account?
            <a
              href="/login"
              class="text-primary hover:underline font-semibold transition-colors ml-1"
            >
              Sign in here
            </a>
          </p>
        </div>

        <div
          class="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-xs animate-fade-in animate-delay-700"
        >
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Label from "@/components/ui/label/Label.vue";
import Progress from "@/components/ui/progress/Progress.vue";
import { useAuthStore } from "@/stores/auth";
import type { PasswordStrength, RegisterForm } from "@/types/registerForm";
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  CircleUser,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

  const authStore = useAuthStore();
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const router = useRouter();

  const formData = ref<RegisterForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const hasMinLength = computed(() => formData.value.password.length >= 8);
  const hasUpperCase = computed(() => /[A-Z]/.test(formData.value.password));
  const hasNumber = computed(() => /[0-9]/.test(formData.value.password));
  const hasSpecialChar = computed(() =>
    /[!@#$%^&*(),.?":{}|<>]/.test(formData.value.password),
  );

  const passwordStrength = ref<PasswordStrength>({
    percentage: 0,
    Label: "Too Weak",
    colorClass: "text-red-400",
    bgClass: "bg-red-500",
  });

  const calculatePasswordStrength = () => {
    let strength = 0;
    const password = formData.value.password;

    if (password.length === 0) {
      passwordStrength.value = {
        percentage: 0,
        Label: "Too Weak",
        colorClass: "text-red-500",
        bgClass: "bg-red-500",
      };
      return;
    }

    if (hasMinLength.value) strength += 25;
    if (hasUpperCase.value) strength += 25;
    if (hasNumber.value) strength += 25;
    if (hasSpecialChar.value) strength += 25;

    if (strength <= 40) {
      passwordStrength.value = {
        percentage: strength,
        Label: "Weak",
        colorClass: "text-red-500",
        bgClass: "bg-red-500",
      };
    } else if (strength <= 60) {
      passwordStrength.value = {
        percentage: strength,
        Label: "Fair",
        colorClass: "text-orange-500",
        bgClass: "bg-orange-500",
      };
    } else if (strength <= 80) {
      passwordStrength.value = {
        percentage: strength,
        Label: "Good",
        colorClass: "text-yellow-500",
        bgClass: "bg-yellow-500",
      };
    } else {
      passwordStrength.value = {
        percentage: strength,
        Label: "Strong",
        colorClass: "text-green-500",
        bgClass: "bg-green-500",
      };
    }
  };

  const handleRegister = async () => {
    authStore.clearErrors();
    await authStore.register(formData.value);
  };

  onMounted(() => {
    if (authStore.isLoggedIn) {
      router.push({ name: "dashboard" });
    }
  });
</script>
