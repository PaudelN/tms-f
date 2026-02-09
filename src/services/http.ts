import { useAuthStore } from "@/stores/auth";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import router from "@/router"; 

const getApiUrl = (): string => {
  return (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api";
};
const baseURL = getApiUrl();
const sanctumUrl = "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

let csrfTokenFetched = false;

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!csrfTokenFetched && !config.url?.includes("sanctum/csrf-cookie")) {
      try {
        await axios.get(`${sanctumUrl}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });
        csrfTokenFetched = true;
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
const auth = useAuthStore();

    if (error.response?.status === 419) {
      csrfTokenFetched = false;
      auth.cleanAuthState();
      router.push({ name: "login" });
      console.error("CSRF token mismatch. Please refresh and try again.");
    }

    if (error.response?.status === 401) {
      csrfTokenFetched = false;
      auth.cleanAuthState();
      router.push({ name: "login" });
      console.error("Unauthenticated. Redirecting to login...");
    }

    if (error.response?.status === 422) {
      router.push({ name: "login" });
      console.error("Validation errors:", error.response.data);
    }

    if (error.response?.status === 404) {
      router.push({ name: "not-found" });
      console.error("Not found errors:", error.response.data);
    }

    if (error.response?.status === 500) {
      router.push({ name: "server-error" });
      console.error("Server errors:", error.response.data);
    }

    return Promise.reject(error);
  },
);

export const refreshCsrfToken = async (): Promise<void> => {
  try {
    await axios.get(`${sanctumUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfTokenFetched = true;
  } catch (error) {
    console.error("Failed to refresh CSRF token:", error);
    throw error;
  }
};

export const resetCsrfToken = (): void => {
  csrfTokenFetched = false;
};

export default api;
