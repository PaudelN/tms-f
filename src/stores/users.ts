import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userApi } from "@/api/modules/users";
import type { User, UserFormData } from "@/types";

export const useUserStore = defineStore("users", () => {
  // State
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const activeUsers = computed(() =>
    users.value.filter((user) => !user.deleted_at),
  );

  const deletedUsers = computed(() =>
    users.value.filter((user) => user.deleted_at),
  );

  const getUserById = computed(() => {
    return (id: number) => users.value.find((user) => user.id === id);
  });

  // Actions
  async function fetchUsers() {
    loading.value = true;
    error.value = null;
    try {
      users.value = await userApi.getAll();
    } catch (err: any) {
      error.value = err.message || "Failed to fetch users";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const user = await userApi.getById(id);
      currentUser.value = user;

      // Update in users array if exists
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = user;
      } else {
        users.value.push(user);
      }

      return user;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch user";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createUser(data: UserFormData) {
    loading.value = true;
    error.value = null;
    try {
      const user = await userApi.create(data);
      users.value.push(user);
      return user;
    } catch (err: any) {
      error.value = err.message || "Failed to create user";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id: number, data: Partial<UserFormData>) {
    loading.value = true;
    error.value = null;
    try {
      const user = await userApi.update(id, data);

      // Update in users array
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = user;
      }

      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = user;
      }

      return user;
    } catch (err: any) {
      error.value = err.message || "Failed to update user";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await userApi.delete(id);

      // Mark as deleted locally
      const user = users.value.find((u) => u.id === id);
      if (user) {
        user.deleted_at = new Date().toISOString();
      }
    } catch (err: any) {
      error.value = err.message || "Failed to delete user";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function restoreUser(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await userApi.restore(id);

      // Remove deleted_at locally
      const user = users.value.find((u) => u.id === id);
      if (user) {
        user.deleted_at = undefined;
      }
    } catch (err: any) {
      error.value = err.message || "Failed to restore user";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function forceDeleteUser(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await userApi.forceDelete(id);

      // Remove from array
      users.value = users.value.filter((u) => u.id !== id);

      // Clear current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = null;
      }
    } catch (err: any) {
      error.value = err.message || "Failed to permanently delete user";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  function $reset() {
    users.value = [];
    currentUser.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    users,
    currentUser,
    loading,
    error,

    // Getters
    activeUsers,
    deletedUsers,
    getUserById,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    forceDeleteUser,
    clearError,
    $reset,
  };
});
