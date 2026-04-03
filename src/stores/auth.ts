import { notify } from "@/helpers/toast";
import api, { resetCsrfToken } from "@/lib/axios";
import { globalCacheRegistry } from "@/lib/useRequestCache";
import router from "@/router";
import type { LoginForm } from "@/types/loginForm";
import type { Errors, RegisterForm } from "@/types/registerForm";
import { User } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const persistedStoreKeys = ["auth", "workspace-store", "ui-table-store"];

    const clearCookie = (name: string) => {
      const host = window.location.hostname;
      const cookieVariants = [
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`,
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${host}`,
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${host}`,
      ];
      cookieVariants.forEach((cookie) => {
        document.cookie = cookie;
      });
    };

    const clearPersistedState = () => {
      persistedStoreKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    };

    const user = ref<User | null>(null);
    const users = ref<User[]>([]);
    const isLoading = ref<boolean>(false);
    const registrationErrors = ref<Errors>({});
    const loginErrors = ref<Errors>({});
    const successMessage = ref<string>("");
    const isLoggedIn = ref<boolean>(false);

    const register = async (formData: RegisterForm) => {
      registrationErrors.value = {};
      successMessage.value = "";

      if (!formData.name.trim()) {
        registrationErrors.value.name = "Name is required";
        notify.warning("Signup validation", "Name is required.");
        return;
      }
      if (!formData.email.trim()) {
        registrationErrors.value.email = "Email is required";
        notify.warning("Signup validation", "Email is required.");
        return;
      }
      if (formData.password.length < 8) {
        registrationErrors.value.password =
          "Password must be at least 8 characters";
        notify.warning(
          "Signup validation",
          "Password must be at least 8 characters.",
        );
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        registrationErrors.value.password_confirmation =
          "Passwords do not match";
        notify.warning("Signup validation", "Passwords do not match.");
        return;
      }

      isLoading.value = true;

      try {
        await api.post("/register", formData);
        await getUser();
        successMessage.value = "Account created successfully! Redirecting...";
        notify.success("Signup successful", "Your account has been created.");
        setTimeout(() => {
          router.push({ name: "dashboard" });
        }, 1000);
      } catch (error: any) {
        console.error("Registration failed:", error);
        if (error.response?.data?.errors) {
          registrationErrors.value = error.response.data.errors;
        } else if (error.response?.data?.message) {
          registrationErrors.value.general = error.response.data.message;
        } else {
          registrationErrors.value.general =
            "Registration failed. Please try again.";
        }
        notify.error(
          "Signup failed",
          registrationErrors.value.general ??
            "Please review your details and try again.",
        );
      } finally {
        isLoading.value = false;
      }
    };

    const login = async (formData: LoginForm) => {
      loginErrors.value = {};
      successMessage.value = "";

      if (!formData.email.trim()) {
        loginErrors.value.email = "Email is required";
        notify.warning("Login validation", "Email is required.");
        return;
      }
      if (!formData.password) {
        loginErrors.value.password = "Password is required";
        notify.warning("Login validation", "Password is required.");
        return;
      }

      isLoading.value = true;

      try {
        await api.post("/login", {
          email: formData.email,
          password: formData.password,
        });
        await getUser();
        successMessage.value = "Login successful! Redirecting...";
        notify.success("Login successful", "Welcome back.");
        setTimeout(() => {
          router.push({ name: "dashboard" });
        }, 1000);
      } catch (error: any) {
        console.error("Login failed:", error);
        if (error.response?.data?.errors) {
          loginErrors.value = error.response.data.errors;
        } else if (error.response?.data?.message) {
          loginErrors.value.general = error.response.data.message;
        } else {
          loginErrors.value.general =
            "Login failed. Please check your credentials.";
        }
        notify.error(
          "Login failed",
          loginErrors.value.general ??
            "Please check your credentials and try again.",
        );
      } finally {
        isLoading.value = false;
      }
    };

    const getUser = async () => {
      try {
        const response = await api.get("/user");
        console.log(response);
        
        user.value = response.data;
        isLoggedIn.value = true;
      } catch (error: any) {
        console.error("Failed to fetch user:", error);
        user.value = null;
        isLoggedIn.value = false;
        throw error; // ← rethrow so callers can handle it
      }
    };

    const logout = async () => {
      try {
        await api.post("/logout");
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        cleanAuthState(true);
        notify.info("Logged out", "You have been signed out.");
        router.push({ name: "login" });
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        users.value = response.data.data || response.data;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        users.value = [];
      }
    };

    const clearErrors = () => {
      registrationErrors.value = {};
      loginErrors.value = {};
      successMessage.value = "";
    };

    const cleanAuthState = (clearPersistedData = false) => {
      user.value = null;
      users.value = [];
      isLoggedIn.value = false;
      resetCsrfToken();

      if (clearPersistedData) {
        clearPersistedState();
      }

      // CHANGED: wipe every tagged cache so the next login always gets
      // fresh data. One call covers all stores.
      globalCacheRegistry.invalidateTag("workspaces");
      globalCacheRegistry.invalidateTag("projects");
      globalCacheRegistry.invalidateTag("pipelines");
      globalCacheRegistry.invalidateTag("pipeline-stages");
      globalCacheRegistry.invalidateTag("tasks");
      globalCacheRegistry.invalidateTag("media");

      clearCookie("XSRF-TOKEN");
      clearCookie("laravel_session");
    };

    // ── return — IDENTICAL to original ───────────────────────────────────────
    return {
      user,
      users,
      isLoading,
      registrationErrors,
      loginErrors,
      successMessage,

      isLoggedIn,

      register,
      login,
      logout,
      getUser,
      fetchUsers,
      clearErrors,
      cleanAuthState,
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ["user", "isLoggedIn"],
    },
  },
);
