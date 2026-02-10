import { toast as sonnerToast } from "vue-sonner";

export const toast = {
  success(message: string, description?: string) {
    sonnerToast.success(message, { description });
  },
  error(message: string, description?: string) {
    sonnerToast.error(message, { description });
  },
  info(message: string, description?: string) {
    sonnerToast.info(message, { description });
  },
  warning(message: string, description?: string) {
    sonnerToast.warning(message, { description });
  },
  loading(message: string) {
    return sonnerToast.loading(message);
  },
  promise<T>(
    promise: Promise<T>,
    labels: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) {
    return sonnerToast.promise(promise, labels);
  },
};
