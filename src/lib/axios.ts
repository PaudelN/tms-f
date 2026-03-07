import { notify } from "@/helpers/toast";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const getApiUrl = (): string => {
  return (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api";
};

const getSanctumUrl = (apiUrl: string): string => {
  const explicitSanctumUrl = (import.meta as any).env?.VITE_SANCTUM_URL as string | undefined;

  const toSanctumOrigin = (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.origin;
    } catch {
      return url.replace(/\/+$/, "");
    }
  };

  if (explicitSanctumUrl) {
    return toSanctumOrigin(explicitSanctumUrl);
  }

  return toSanctumOrigin(apiUrl);
};

const baseURL = getApiUrl();
const sanctumUrl = getSanctumUrl(baseURL);

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

let csrfTokenFetched = false;
let csrfTokenRequest: Promise<void> | null = null;

const shouldFetchCsrfToken = (config: InternalAxiosRequestConfig): boolean => {
  const method = config.method?.toUpperCase();

  if (!method) {
    return false;
  }

  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
};

const fetchCsrfToken = async (): Promise<void> => {
  if (csrfTokenFetched) {
    return;
  }

  if (!csrfTokenRequest) {
    csrfTokenRequest = axios
      .get(`${sanctumUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      })
      .then(() => {
        csrfTokenFetched = true;
      })
      .finally(() => {
        csrfTokenRequest = null;
      });
  }

  await csrfTokenRequest;
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.url?.includes("sanctum/csrf-cookie") && shouldFetchCsrfToken(config)) {
      try {
        await fetchCsrfToken();
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
      notify.warning("Session expired", "Please log in again to continue.");
      console.error("CSRF token mismatch. Please refresh and try again.");
    }

    if (error.response?.status === 401) {
      csrfTokenFetched = false;
      auth.cleanAuthState();
      router.push({ name: "login" });
      notify.warning("Authentication required", "Please log in to continue.");
      console.error("Unauthenticated. Redirecting to login...");
    }

    if (error.response?.status === 422) {
      router.push({ name: "login" });
      notify.error("Validation failed", "Please review your input and try again.");
      console.error("Validation errors:", error.response.data);
    }

    if (error.response?.status === 404) {
      router.push({ name: "not-found" });
      notify.error("Resource not found", "The requested item could not be found.");
      console.error("Not found errors:", error.response.data);
    }

    if (error.response?.status === 500) {
      router.push({ name: "server-error" });
      notify.error("Server error", "Something went wrong on the server. Please try again.");
      console.error("Server errors:", error.response.data);
    }

    if (!error.response) {
      notify.error("Network error", "Unable to reach the server. Please check your connection.");
    }

    if (error.response && ![401, 404, 419, 422, 500].includes(error.response.status)) {
      notify.error("Request failed", "An unexpected error occurred. Please try again.");
    }

    return Promise.reject(error);
  },
);

export const refreshCsrfToken = async (): Promise<void> => {
  try {
    await fetchCsrfToken();
  } catch (error) {
    console.error("Failed to refresh CSRF token:", error);
    throw error;
  }
};

export const resetCsrfToken = (): void => {
  csrfTokenFetched = false;
  csrfTokenRequest = null;
};

export default api;
