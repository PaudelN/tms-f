import { toast } from "vue-sonner";

export const toastSuccess = (message: string, description?: string) =>
  toast.success(message, description ? { description } : undefined);

export const toastError = (message: string, description?: string) =>
  toast.error(message, description ? { description } : undefined);

export const toastInfo = (message: string, description?: string) =>
  toast(message, description ? { description } : undefined);

export { toast };
