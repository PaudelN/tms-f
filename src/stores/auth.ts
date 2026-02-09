import api from "@/services/http";
import router from "@/router";
import type { LoginForm } from "@/types/loginForm";
import type { Errors, RegisterForm } from "@/types/registerForm";
import { User } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    // State
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
        return;
      }
      if (!formData.email.trim()) {
        registrationErrors.value.email = "Email is required";
        return;
      }
      if (formData.password.length < 8) {
        registrationErrors.value.password =
          "Password must be at least 8 characters";
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        registrationErrors.value.password_confirmation =
          "Passwords do not match";
        return;
      }

      isLoading.value = true;

      try {
        await api.post("/register", formData);
        await getUser();
        successMessage.value = "Account created successfully! Redirecting...";

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
      } finally {
        isLoading.value = false;
      }
    };

    const login = async (formData: LoginForm) => {
      loginErrors.value = {};
      successMessage.value = "";

      if (!formData.email.trim()) {
        loginErrors.value.email = "Email is required";
        return;
      }
      if (!formData.password) {
        loginErrors.value.password = "Password is required";
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
      } finally {
        isLoading.value = false;
      }
    };

    const getUser = async () => {
      try {
        const response = await api.get("/user");
        user.value = response.data;
        isLoggedIn.value = true;
      } catch (error: any) {
        console.error("Failed to fetch user:", error);
        user.value = null;
      }
    };

    const logout = async () => {
      try {
        await api.post("/logout");
        isLoggedIn.value = false;
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        user.value = null;
        users.value = [];
        isLoggedIn.value = false;

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

    const cleanAuthState = ()=>{
      user.value = null;
      isLoggedIn.value = false;
    }

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
      pick: ["user","isLoggedIn"],
    },
  },
);
