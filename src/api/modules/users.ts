import api from "../../services/axios";
import { API_ENDPOINTS } from "../../services/endpoints";
import type { User, UserFormData, ApiResponse } from "@/types";

export const userApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USERS.BASE,
    );
    return response.data.data || [];
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.SHOW(id),
    );
    return response.data.data!;
  },

  /**
   * Create new user
   */
  async create(data: UserFormData): Promise<User> {
    const response = await api.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.BASE,
      data,
    );
    return response.data.data!;
  },

  /**
   * Update user
   */
  async update(id: number, data: Partial<UserFormData>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data,
    );
    return response.data.data!;
  },

  /**
   * Soft delete user
   */
  async delete(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  /**
   * Restore soft deleted user
   */
  async restore(id: number): Promise<void> {
    await api.post(API_ENDPOINTS.USERS.RESTORE(id));
  },

  /**
   * Permanently delete user
   */
  async forceDelete(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.USERS.FORCE_DELETE(id));
  },
};
